import { Deployment, Environment } from '../common/environment';
import {
  base64StringToJson,
  formatDate,
  sleep,
  unixTimestampToMilliseconds,
} from '../common/helpers';
import { consoleLog, LogFunctionType } from '../common/logger';
import { ClaimableValidatorError } from '../data-availability-models/claimable-validator-errors';
import { DAResult } from '../data-availability-models/da-result';
import {
  DAPublicationWithTimestampProofsBatchResult,
  DATimestampProofsResponse,
} from '../data-availability-models/data-availability-timestamp-proofs';
import {
  DAEventType,
  DAPublicationsBatchResult,
  DAStructurePublication,
  PublicationTypedData,
} from '../data-availability-models/publications/data-availability-structure-publication';
import { LOCAL_NODE_URL, setupAnvilLocalNode } from '../evm/anvil';
import { EthereumNode } from '../evm/ethereum';
import {
  BundlrBulkTxSuccess,
  getBundlrBulkTxsAPI,
} from '../input-output/bundlr/get-bundlr-bulk-txs.api';
import {
  getDataAvailabilityTransactionsAPI,
  getDataAvailabilityTransactionsAPIResponse,
} from '../input-output/bundlr/get-data-availability-transactions.api';
import { TIMEOUT_ERROR } from '../input-output/common';
import {
  FailedTransactionsDb,
  getLastEndCursorDb,
  saveEndCursorDb,
  saveFailedTransactionDb,
  saveTxDAMetadataDb,
  saveTxDb,
  saveTxTimestampProofsMetadataDb,
  startDb,
  TxValidatedResult,
} from '../input-output/db';
import { checkDAProofWithMetadata } from '../proofs/check-da-proof';
// import { watchBlocks } from './block.watcher';
import { verifierFailedSubmissionsWatcher } from './failed-submissons.watcher';
import { StreamCallback } from './stream.type';

/**
 * This function processes a failed transaction by saving it to the database.
 * It checks if there is another process currently saving a failed transaction,
 * and if so, it waits for a short period of time before trying again.
 * @param failedTransaction - The failed transaction to be saved to the database.
 * @param log - A logging function to be used for debugging and information purposes.
 */
let isProcessingFailedSubmission = false;
const processFailedSubmissions = async (
  failedTransaction: FailedTransactionsDb,
  log: LogFunctionType
) => {
  while (isProcessingFailedSubmission) {
    await sleep(10);
  }

  isProcessingFailedSubmission = true;

  await saveFailedTransactionDb(failedTransaction);
  log('process failed submissions saved to db', failedTransaction);

  isProcessingFailedSubmission = false;
};

/**
 * Builds a validation result object for a transaction ID and a data availability verification result.
 * @param txId - The ID of the transaction to validate.
 * @param result - The result of verifying data availability on-chain.
 * @returns A `TxValidatedResult` object indicating whether the verification was successful or not, along with relevant data.
 */
const buildTxValidationResult = (
  txId: string,
  result: DAResult<
    void | DAStructurePublication<DAEventType, PublicationTypedData>,
    DAStructurePublication<DAEventType, PublicationTypedData>
  >
): TxValidatedResult => {
  if (result.isSuccess()) {
    return {
      proofTxId: txId,
      success: true,
      dataAvailabilityResult: result.successResult!,
    };
  }

  return {
    proofTxId: txId,
    success: false,
    failureReason: result.failure!,
    dataAvailabilityResult: result.context!,
  };
};

/**
 * Builds an array of DAPublicationsBatchResult objects from an array of BundlrBulkTxSuccess objects.
 * Also saves the transaction metadata to the database.
 * @param results - The array of BundlrBulkTxSuccess objects to process.
 * @returns An array of DAPublicationsBatchResult objects.
 */
const buildDAPublicationsBatchResult = (
  results: BundlrBulkTxSuccess[]
): DAPublicationsBatchResult[] => {
  const daPublications: DAPublicationsBatchResult[] = [];

  for (let i = 0; i < results.length; i++) {
    const result = results[i];

    const daPublication = base64StringToJson(result.data) as DAStructurePublication<
      DAEventType,
      PublicationTypedData
    >;
    saveTxDAMetadataDb(result.id, daPublication);

    daPublications.push({
      id: result.id,
      daPublication,
      submitter: result.address,
    });
  }

  return daPublications;
};

/**
 * Builds an array of DAPublicationWithTimestampProofsBatchResult objects based on the results of multiple bundled transactions.
 * @param results The array of BundlrBulkTxSuccess objects to process.
 * @param daPublications The array of DAPublicationsBatchResult objects corresponding to the original set of transactions.
 * @returns An array of DAPublicationWithTimestampProofsBatchResult objects with timestamp proofs included.
 */
const buildDAPublicationsWithTimestampProofsBatchResult = async (
  results: BundlrBulkTxSuccess[],
  daPublications: DAPublicationsBatchResult[]
): Promise<DAPublicationWithTimestampProofsBatchResult[]> => {
  const daPublicationsWithTimestampProofs: DAPublicationWithTimestampProofsBatchResult[] = [];

  for (let i = 0; i < results.length; i++) {
    const result = results[i];

    const timestampProofsData = base64StringToJson(result.data) as DATimestampProofsResponse;

    saveTxTimestampProofsMetadataDb(result.id, timestampProofsData);

    daPublicationsWithTimestampProofs.push({
      ...daPublications[i],
      submitter: result.address,
      timestampProofsData,
    });
  }

  return daPublicationsWithTimestampProofs;
};

/**
 * Checks the data availability proofs and their corresponding timestamp proofs for a batch of DA submissions.
 * Saves the validation result for each submission to the database and optionally streams the result to a provided callback.
 * @param arweaveTransactions - The data availability submissions to check.
 * @param ethereumNode - The Ethereum node to use for verification.
 * @param stream - An optional callback function to stream the validation results.
 */
const checkDAProofsBatch = async (
  arweaveTransactions: getDataAvailabilityTransactionsAPIResponse,
  ethereumNode: EthereumNode,
  stream?: StreamCallback
): Promise<void> => {
  // Get bulk data availability proofs.
  const bulkDAProofs = await getBundlrBulkTxsAPI(
    arweaveTransactions.edges.map((edge) => edge.node.id)
  );
  if (bulkDAProofs === TIMEOUT_ERROR) {
    throw new Error('getBundlrBulkTxsAPI for proofs timed out');
  }

  // Build the data availability publication result for each submission.
  const daPublications = buildDAPublicationsBatchResult(bulkDAProofs.success);

  // Get bulk timestamp proofs.
  const bulkDATimestampProofs = await getBundlrBulkTxsAPI(
    daPublications.map((pub) => pub.daPublication.timestampProofs.response.id)
  );
  if (bulkDATimestampProofs === TIMEOUT_ERROR) {
    throw new Error('getBundlrBulkTxsAPI for timestamps timed out');
  }

  // Build the data availability publication result with timestamp proofs for each submission.
  const daPublicationsWithTimestampProofs = await buildDAPublicationsWithTimestampProofsBatchResult(
    bulkDATimestampProofs.success,
    daPublications
  );

  // Process each submission in parallel.
  await Promise.allSettled(
    daPublicationsWithTimestampProofs.map(async (publication) => {
      const txId = publication.id;
      const log = (message: string, ...optionalParams: any[]) => {
        consoleLog(
          '\x1b[32m',
          `LENS VERIFICATION NODE - tx at - ${formatDate(
            new Date(unixTimestampToMilliseconds(Number(publication.daPublication.event.timestamp)))
          )} - ${txId} - ${message}`,
          ...optionalParams
        );
      };

      try {
        const result = await checkDAProofWithMetadata(txId, publication, ethereumNode, {
          verifyPointer: true,
          log: () => {},
        });

        const txValidatedResult: TxValidatedResult = buildTxValidationResult(txId, result);

        // write to the database!
        saveTxDb(txId, txValidatedResult);

        if (result.isFailure()) {
          // fire and forget
          processFailedSubmissions(
            { txId, reason: result.failure!, submitter: publication.submitter },
            () => {}
          );
        }

        if (stream) {
          log(`stream the DA publication - ${txId}`);
          // stream the result to the callback defined
          stream(txValidatedResult);
        }

        log(`${result.isFailure() ? `FAILED - ${result.failure!}` : 'OK'}`);
      } catch (e: any) {
        saveTxDb(txId, {
          proofTxId: txId,
          success: false,
          failureReason: ClaimableValidatorError.UNKNOWN,
          dataAvailabilityResult: undefined,
          extraErrorInfo: typeof e === 'string' ? e : e.message || undefined,
        });

        // fire and forget
        processFailedSubmissions(
          { txId, reason: ClaimableValidatorError.UNKNOWN, submitter: publication.submitter },
          () => {}
        );

        log(e);
      }
    })
  );
};

/**
 * Starts the DA verifier node to watch for new data availability submissions and verify their proofs.
 * @param ethereumNode The Ethereum node to use for verification.
 * @param dbLocationFolderPath The folder path for the location of the database.
 * @param stream An optional stream callback function to send results to.
 */
export const startDAVerifierNode = async (
  ethereumNode: EthereumNode,
  dbLocationFolderPath: string,
  stream?: StreamCallback | undefined
) => {
  consoleLog('LENS VERIFICATION NODE - DA verification watcher started...');

  // Start the local node up
  await setupAnvilLocalNode(ethereumNode.nodeUrl);

  // Initialize database.
  startDb(dbLocationFolderPath);
  // watchBlocks(deepClone(ethereumNode));
  verifierFailedSubmissionsWatcher(dbLocationFolderPath);

  // Switch to local node.
  ethereumNode.nodeUrl = LOCAL_NODE_URL;

  // Get the last end cursor.
  let endCursor: string | null = await getLastEndCursorDb();

  let count = 0;

  consoleLog('LENS VERIFICATION NODE - started up..');

  while (true) {
    try {
      // Get new data availability transactions from the server.
      const arweaveTransactions: getDataAvailabilityTransactionsAPIResponse =
        await getDataAvailabilityTransactionsAPI(
          ethereumNode.environment,
          ethereumNode.deployment,
          endCursor
        );

      if (arweaveTransactions.edges.length === 0) {
        consoleLog('LENS VERIFICATION NODE - No new DA items found..');
        // Sleep for 100ms before checking again.
        await sleep(100);
      } else {
        count++;
        consoleLog(
          'LENS VERIFICATION NODE - Found new submissions...',
          arweaveTransactions.edges.length
        );

        // Check DA proofs in batches of 1000 to avoid I/O issues.
        await checkDAProofsBatch(arweaveTransactions, ethereumNode, stream);

        endCursor = arweaveTransactions.pageInfo.endCursor;
        await saveEndCursorDb(endCursor!);

        console.log('completed count', count);
      }
    } catch (error) {
      consoleLog('LENS VERIFICATION NODE - Error while checking for new submissions', error);
      await sleep(100);
    }
  }
};

/**
 * The DA trusting indexer request.
 */
export interface StartDATrustingIndexingRequest {
  stream: StreamCallback;
  environment: Environment;
  /**
   * The deployment to use, only use this if you know what you are doing.
   */
  deployment?: Deployment;
}

/**
 * Starts the DA trusting indexing to watch for new data availability coming in and index them.
 * @param request The trusting index request
 */
export const startDATrustingIndexing = async (request: StartDATrustingIndexingRequest) => {
  consoleLog('LENS DA TRUSTING INDEXING - DA verification indexing starting...');

  let endCursor: string | null = null;

  while (true) {
    try {
      // Get new data availability transactions from the server.
      const arweaveTransactions: getDataAvailabilityTransactionsAPIResponse =
        await getDataAvailabilityTransactionsAPI(
          request.environment,
          request.deployment,
          endCursor
        );

      if (arweaveTransactions.edges.length === 0) {
        consoleLog('LENS DA TRUSTING INDEXING - No new DA items found..');
        // Sleep for 100ms before checking again.
        await sleep(100);
      } else {
        consoleLog(
          'LENS DA TRUSTING INDEXING - Found new submissions...',
          arweaveTransactions.edges.length
        );

        const bulkDAProofs = await getBundlrBulkTxsAPI(
          arweaveTransactions.edges.map((edge) => edge.node.id)
        );
        if (bulkDAProofs === TIMEOUT_ERROR) {
          throw new Error('getBundlrBulkTxsAPI for proofs timed out');
        }

        // Build the data availability publication result for each submission.
        const daPublications = buildDAPublicationsBatchResult(bulkDAProofs.success);

        // Stream the results to the callback.
        daPublications.forEach((publication) => {
          request.stream({
            proofTxId: publication.id,
            success: true,
            dataAvailabilityResult: publication.daPublication,
          });
        });

        endCursor = arweaveTransactions.pageInfo.endCursor;
      }
    } catch (error) {
      consoleLog('LENS DA TRUSTING INDEXING - Error while checking for new submissions', error);
      await sleep(100);
    }
  }
};
