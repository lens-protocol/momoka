import { Promise as BluebirdPromise } from 'bluebird';
import {
  base64StringToJson,
  createTimeoutPromise,
  formatDate,
  unixTimestampToMilliseconds,
} from '../common/helpers';
import { consoleDynamic, LoggerLevelColours } from '../common/logger';
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
import { anvilForkFrom, getAnvilCurrentBlockNumber } from '../evm/anvil';
import { EthereumNode } from '../evm/ethereum';
import {
  BundlrBulkTxsResponse,
  BundlrBulkTxSuccess,
  getBundlrBulkTxsAPI,
} from '../input-output/bundlr/get-bundlr-bulk-txs.api';
import { TIMEOUT_ERROR } from '../input-output/common';
import {
  saveTxDAMetadataDb,
  saveTxDb,
  saveTxTimestampProofsMetadataDb,
  TxValidatedResult,
} from '../input-output/db';
import { failedDAProofQueue } from '../queue/known.queue';
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
 *          turned into a promise as base64StringToJson is CPU intensive.
 */
export const buildDAPublicationsBatchResult = (
  results: BundlrBulkTxSuccess[]
): Promise<DAPublicationsBatchResult[]> => {
  const batchResult = results.map((result) => {
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
  });

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
  return Promise.resolve(
    results.map((result, i) => {
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

const getBulkDAProofs = async (txIds: string[]): Promise<BundlrBulkTxsResponse> => {
  const bulkDAProofs = await getBundlrBulkTxsAPI(txIds);
  if (bulkDAProofs === TIMEOUT_ERROR) {
    throw new Error('getBundlrBulkTxsAPI for proofs timed out');
  }
  return bulkDAProofs;
};

const getBulkTimestampProofs = async (ids: string[]): Promise<BundlrBulkTxsResponse> => {
  const bulkDATimestampProofs = await getBundlrBulkTxsAPI(ids);
  if (bulkDATimestampProofs === TIMEOUT_ERROR) {
    throw new Error('getBundlrBulkTxsAPI for timestamps timed out');
  }
  return bulkDATimestampProofs;
};

export interface ProofResult {
  txId: string;
  success: boolean;
  claimableValidatorError?: ClaimableValidatorError;
}

const processPublications = async (
  daPublicationsWithTimestampProofs: DAPublicationWithTimestampProofsBatchResult[],
  ethereumNode: EthereumNode,
  retryAttempt: boolean,
  stream?: StreamCallback
): Promise<ProofResult[]> => {
  return await BluebirdPromise.map(
    daPublicationsWithTimestampProofs,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (publication: any) => {
      const txId = publication.id;
      const log = (
        color: LoggerLevelColours,
        message: string,
        ...optionalParams: unknown[]
      ): void => {
        consoleDynamic(
          color,
          `LENS VERIFICATION NODE - ${retryAttempt ? 'retry attempt' : ''} tx at - ${formatDate(
            new Date(unixTimestampToMilliseconds(Number(publication.daPublication.event.timestamp)))
          )} - ${txId} - ${message}`,
          ...optionalParams
        );
      };

      try {
        console.time('blah' + txId);
        const checkPromise = checkDAProofWithMetadata(txId, publication, ethereumNode, {
          ...getDefaultCheckDASubmissionOptions,
          byPassDb: retryAttempt,
        });

        const { promise: timeoutPromise, timeoutId } = createTimeoutPromise(10000);

        // if it throws it leave here
        const result = (await Promise.race([checkPromise, timeoutPromise])) as DAResult<
          void | DAStructurePublication<DAEventType, PublicationTypedData>,
          DAStructurePublication<DAEventType, PublicationTypedData>
        >;

        clearTimeout(timeoutId);
        console.timeEnd('blah' + txId);

        const txValidatedResult: TxValidatedResult = buildTxValidationResult(txId, result);

        // write to the database!
        saveTxDb(txId, txValidatedResult);

        if (stream) {
          log(LoggerLevelColours.INFO, `stream the DA publication - ${txId}`);
          // stream the result to the callback defined
          stream(txValidatedResult);
        }

        if (result.isFailure()) {
          failedDAProofQueue.enqueue({
            txId,
            reason: result.failure!,
            submitter: publication.submitter,
          });
          log(LoggerLevelColours.ERROR, `FAILED - ${result.failure!}`);
        } else {
          log(LoggerLevelColours.SUCCESS, 'OK');
        }

        return {
          txId,
          success: result.isSuccess(),
          claimableValidatorError: result.isFailure() ? result.failure! : undefined,
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        console.timeEnd('blah' + txId);
        console.log(`FAILED - ${e.message || e}`);
        saveTxDb(txId, {
          proofTxId: txId,
          success: false,
          failureReason: ClaimableValidatorError.UNKNOWN,
          dataAvailabilityResult: undefined,
          extraErrorInfo: typeof e === 'string' ? e : e.message || undefined,
        });

        return {
          txId,
          success: false,
          claimableValidatorError: ClaimableValidatorError.UNKNOWN,
        };
      }
    },
    // anything more then this will cause the node to crash
    // TODO PLAY AROUND WITH THIS
    { concurrency: 120 }
  );
};

/**
 * Checks the data availability proofs and their corresponding timestamp proofs for a batch of DA submissions.
 * Saves the validation result for each submission to the database and optionally streams the result to a provided callback.
 * @param txIds - The data availability submissions to tx ids to check.
 * @param ethereumNode - The Ethereum node to use for verification.
 * @param stream - An optional callback function to stream the validation results.
 */
export const checkDAProofsBatch = async (
  txIds: string[],
  ethereumNode: EthereumNode,
  retryAttempt: boolean,
  usLocalNode = false,
  stream?: StreamCallback
): Promise<ProofResult[]> => {
  //console.log('txIds', txIds);
  console.time('getBundlrBulkTxsAPI');
  // Get bulk data availability proofs.
  const bulkDAProofs = await getBulkDAProofs(txIds);
  console.timeEnd('getBundlrBulkTxsAPI');

  console.time('buildDAPublicationsBatchResult');
  // Build the data availability publication result for each submission.
  const daPublications = await buildDAPublicationsBatchResult(bulkDAProofs.success);
  console.timeEnd('buildDAPublicationsBatchResult');

  if (usLocalNode) {
    const mostRecentBlockNumber = Math.max(
      ...daPublications.map((d) => d.daPublication.chainProofs.thisPublication.blockNumber)
    );

    console.time('getAnvilCurrentBlockNumber');

    const anvilCurrentBlockNumber = await getAnvilCurrentBlockNumber();

    if (mostRecentBlockNumber > anvilCurrentBlockNumber) {
      await anvilForkFrom(ethereumNode, mostRecentBlockNumber);
    }
  }

  // get the current lastest block we have seen

  console.time('getBundlrBulkTxsAPI');
  // Get bulk timestamp proofs.
  const bulkDATimestampProofs = await getBulkTimestampProofs(
    daPublications.map((pub) => pub.daPublication.timestampProofs.response.id)
  );
  console.timeEnd('getBundlrBulkTxsAPI');

  //console.time('buildDAPublicationsWithTimestampProofsBatchResult');
  // Build the data availability publication result with timestamp proofs for each submission.
  const daPublicationsWithTimestampProofs = await buildDAPublicationsWithTimestampProofsBatchResult(
    bulkDATimestampProofs.success,
    daPublications
  );

  return await processPublications(
    daPublicationsWithTimestampProofs,
    ethereumNode,
    retryAttempt,
    stream
  );
};
