import { Promise as BluebirdPromise } from 'bluebird';
import {
  base64StringToJson,
  chunkArray,
  createTimeoutPromise,
  formatDate,
  unixTimestampToMilliseconds,
} from '../common/helpers';
import { LoggerLevelColours, consoleDynamic } from '../common/logger';
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
import { BonsaiValidatorError } from '../data-availability-models/validator-errors';
import { anvilForkFrom, getAnvilCurrentBlockNumber } from '../evm/anvil';
import { EthereumNode } from '../evm/ethereum';
import {
  BundlrBulkTxSuccess,
  BundlrBulkTxsResponse,
  getBundlrBulkTxsAPI,
} from '../input-output/bundlr/get-bundlr-bulk-txs.api';
import { TIMEOUT_ERROR } from '../input-output/common';
import { saveTxDAMetadataDb, saveTxDb, saveTxTimestampProofsMetadataDb } from '../input-output/db';
import { TxValidatedResult } from '../input-output/tx-validated-results';
import { failedDAProofQueue } from '../queue/known.queue';
import { shouldRetry } from '../queue/process-retry-check-da-proofs.queue';
import { invariant } from '../utils/invariant';
import { StreamCallback } from '../watchers/models/stream.type';
import { checkDAProofWithMetadata } from './check-da-proof';
import { getDefaultCheckDASubmissionOptions } from './models/check-da-submisson-options';

/**
 * Builds a validation result object for a transaction ID and a data availability verification result.
 * @param txId - The ID of the transaction to validate.
 * @param result - The result of verifying data availability on-chain.
 * @returns A `TxValidatedResult` object indicating whether the verification was successful or not, along with relevant data.
 */
const buildTxValidationResult = (
  txId: string,
  result: DAResult<
    DAStructurePublication<DAEventType, PublicationTypedData>,
    DAStructurePublication<DAEventType, PublicationTypedData>
  >
): TxValidatedResult => {
  if (result.isSuccess()) {
    return {
      proofTxId: txId,
      success: true,
      dataAvailabilityResult: result.successResult,
    };
  }

  return {
    proofTxId: txId,
    success: false,
    failureReason: result.failure,
    dataAvailabilityResult: result.context,
  };
};

/**
 * Builds an array of DAPublicationsBatchResult objects from an array of BundlrBulkTxSuccess objects.
 * Also saves the transaction metadata to the database.
 * @param results - The array of BundlrBulkTxSuccess objects to process.
 * @returns An array of DAPublicationsBatchResult objects.
 *          turned into a promise as base64StringToJson is CPU intensive.
 */
export const buildDAPublicationsBatchResult = async (
  results: BundlrBulkTxSuccess[]
): Promise<DAPublicationsBatchResult[]> => {
  const batchResult = await Promise.all(
    // eslint-disable-next-line require-await
    results.map(async (result) => {
      const daPublication = base64StringToJson(result.data) as DAStructurePublication<
        DAEventType,
        PublicationTypedData
      >;
      saveTxDAMetadataDb(result.id, daPublication);

      return {
        id: result.id,
        daPublication,
        submitter: result.address,
      };
    })
  );

  return Promise.resolve(batchResult);
};

/**
 * Builds an array of DAPublicationWithTimestampProofsBatchResult objects based on the results of multiple bundled transactions.
 * @param results The array of BundlrBulkTxSuccess objects to process.
 * @param daPublications The array of DAPublicationsBatchResult objects corresponding to the original set of transactions.
 * @returns An array of DAPublicationWithTimestampProofsBatchResult objects with timestamp proofs included.
 *          turned into a promise as base64StringToJson can be blocking
 */
const buildDAPublicationsWithTimestampProofsBatchResult = (
  results: BundlrBulkTxSuccess[],
  daPublications: DAPublicationsBatchResult[]
): Promise<DAPublicationWithTimestampProofsBatchResult[]> => {
  return Promise.all(
    // eslint-disable-next-line require-await
    results.map(async (result, i) => {
      const timestampProofsData = base64StringToJson(result.data) as DATimestampProofsResponse;

      saveTxTimestampProofsMetadataDb(result.id, timestampProofsData);

      return {
        ...daPublications[i],
        submitter: result.address,
        timestampProofsData,
      };
    })
  );
};

/**
 *  Checks the data availability proofs for a batch of transactions.
 * @param txIds The array of transaction IDs to check.
 */
const getBundlrBulkTxs = async (txIds: string[]): Promise<BundlrBulkTxsResponse> => {
  // can only handle 1000 at a time!
  const txIdsChunks = chunkArray(txIds, 1000);

  const bulkDAProofs = await Promise.all(
    txIdsChunks.map(async (txIdsChunk) => {
      const result = await getBundlrBulkTxsAPI(txIdsChunk);
      if (result === TIMEOUT_ERROR) {
        throw new Error('getBundlrBulkTxsAPI for proofs timed out');
      }
      return result;
    })
  );

  const combinedResponse: BundlrBulkTxsResponse = bulkDAProofs.reduce(
    (acc: BundlrBulkTxsResponse, current: BundlrBulkTxsResponse) => {
      return {
        success: [...acc.success, ...current.success],
        failed: { ...acc.failed, ...current.failed },
      };
    },
    {
      success: [],
      failed: {},
    }
  );

  return combinedResponse;
};

export interface ProofResult {
  txId: string;
  success: boolean;
  validatorError?: BonsaiValidatorError;
}

/**
 *  Checks the data availability proof for a publication
 * @param publication The publication to check
 * @param ethereumNode The ethereum node information
 * @param retryAttempt If its a retry
 * @param stream The callback to stream the result
 */
const processPublication = async (
  publication: DAPublicationWithTimestampProofsBatchResult,
  ethereumNode: EthereumNode,
  retryAttempt: boolean,
  stream?: StreamCallback
): Promise<ProofResult> => {
  const txId = publication.id;

  try {
    const checkPromise = checkDAProofWithMetadata(txId, publication, ethereumNode, {
      ...getDefaultCheckDASubmissionOptions,
      byPassDb: retryAttempt,
    });

    const { promise: timeoutPromise, timeoutId } = createTimeoutPromise(5000);
    const result = await Promise.race([checkPromise, timeoutPromise]);

    clearTimeout(timeoutId);

    // TODO: In case of timeout, what would be the best course of action here? Just throw?
    invariant(result, 'Publication process request timed out');

    const txValidatedResult: TxValidatedResult = buildTxValidationResult(txId, result);

    saveTxDb(txId, txValidatedResult);

    if (stream) {
      // stream the result to the callback defined
      stream(txValidatedResult);
    }

    return {
      txId,
      success: result.isSuccess(),
      validatorError: result.isFailure() ? result.failure : undefined,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    // console.log(`FAILED - ${e.message || e}`);
    saveTxDb(txId, {
      proofTxId: txId,
      success: false,
      failureReason: BonsaiValidatorError.UNKNOWN,
      dataAvailabilityResult: undefined,
      extraErrorInfo: typeof e === 'string' ? e : e.message || undefined,
    });

    return {
      txId,
      success: false,
      validatorError: BonsaiValidatorError.UNKNOWN,
    };
  }
};

/**
 *  Checks the data availability proofs for a set of publications
 * @param publications The publications to check
 * @param ethereumNode The ethereum node information
 * @param retryAttempt If its a retry
 * @param concurrency The concurrency to use < this is how many TCP it will run at
 * @param stream The callback to stream the result
 */
const processPublications = async (
  publications: DAPublicationWithTimestampProofsBatchResult[],
  ethereumNode: EthereumNode,
  retryAttempt: boolean,
  concurrency: number,
  stream?: StreamCallback
): Promise<ProofResult[]> => {
  return await BluebirdPromise.map(
    publications,
    async (publication) => {
      const log = (
        color: LoggerLevelColours,
        message: string,
        ...optionalParams: unknown[]
      ): void => {
        consoleDynamic(
          color,
          `LENS VERIFICATION NODE - ${retryAttempt ? 'retry attempt' : ''} tx at - ${formatDate(
            new Date(unixTimestampToMilliseconds(Number(publication.daPublication.event.timestamp)))
          )} - ${publication.id} - ${message}`,
          ...optionalParams
        );
      };

      const result = await processPublication(publication, ethereumNode, retryAttempt, stream);

      if (result.success) {
        log(LoggerLevelColours.SUCCESS, 'OK');
      } else {
        failedDAProofQueue.enqueue({
          txId: result.txId,
          reason: result.validatorError!,
          submitter: publication.submitter,
        });

        // only log out ones which do not need retrying
        if (!shouldRetry(result.validatorError!)) {
          log(LoggerLevelColours.ERROR, `FAILED - ${result.validatorError!}`);
        }
      }

      return result;
    },
    // this is how we get more TCP but the higher we go
    // the more requirements we need to set on the archive node to handle the load
    // up to the running of node
    { concurrency }
  );
};

/**
 * Checks the data availability proofs and their corresponding timestamp proofs for a batch of DA submissions.
 * Saves the validation result for each submission to the database and optionally streams the result to a provided callback.
 * @param txIds - The data availability submissions to tx ids to check.
 * @param ethereumNode - The Ethereum node to use for verification.
 * @param retryAttempt If its a retry
 * @param concurrency The concurrency to use < this is how many TCP it will run at
 * @param stream - An optional callback function to stream the validation results.
 */
export const checkDAProofsBatch = async (
  txIds: string[],
  ethereumNode: EthereumNode,
  retryAttempt: boolean,
  concurrency: number,
  usLocalNode = false,
  stream?: StreamCallback
): Promise<ProofResult[]> => {
  // Get bulk data availability proofs.
  const bulkDAProofs = await getBundlrBulkTxs(txIds);

  // Build the data availability publication result for each submission.
  const daPublications = await buildDAPublicationsBatchResult(bulkDAProofs.success);

  if (usLocalNode) {
    const mostRecentBlockNumber = Math.max(
      ...daPublications.map((d) => d.daPublication.chainProofs.thisPublication.blockNumber)
    );

    const anvilCurrentBlockNumber = await getAnvilCurrentBlockNumber();

    if (mostRecentBlockNumber > anvilCurrentBlockNumber) {
      await anvilForkFrom(ethereumNode, mostRecentBlockNumber);
    }
  }

  // Get bulk timestamp proofs.
  const bulkDATimestampProofs = await getBundlrBulkTxs(
    daPublications.map((pub) => pub.daPublication.timestampProofs.response.id)
  );

  // Build the data availability publication result with timestamp proofs for each submission.
  const daPublicationsWithTimestampProofs = await buildDAPublicationsWithTimestampProofsBatchResult(
    bulkDATimestampProofs.success,
    daPublications
  );

  return await processPublications(
    daPublicationsWithTimestampProofs,
    ethereumNode,
    retryAttempt,
    concurrency,
    stream
  );
};
