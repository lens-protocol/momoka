import { EthereumNode } from '../evm/ethereum';
import {
  CheckDASubmissionOptions,
  getDefaultCheckDASubmissionOptions,
} from './models/check-da-submisson-options';
import {
  failureWithContext,
  PromiseWithContextResult,
  PromiseWithContextResultOrNull,
  successWithContext,
} from '../data-availability-models/da-result';
import {
  DAEventType,
  DAStructurePublication,
  PublicationTypedData,
} from '../data-availability-models/publications/data-availability-structure-publication';
import { DAProofGateway } from './DAProofGateway';
import { SyncVerifier } from './SyncVerifier';
import { DAProofChecker } from './DAProofChecker';
import { LogFunctionType } from '../common/logger';
import { TxValidatedFailureResult } from '../input-output/tx-validated-results';
import { getTxDb } from '../input-output/db';
import { DAPublicationWithTimestampProofsBatchResult } from '../data-availability-models/data-availability-timestamp-proofs';

const gateway = new DAProofGateway();
const verifier = new SyncVerifier();
const checker = new DAProofChecker(verifier, gateway);

/**
 * Checks if the given transaction ID has already been checked and returns the corresponding publication.
 * If the transaction ID is found in the database, returns either a success or failure result depending on whether the
 * publication was validated successfully or not, respectively.
 * If the transaction ID is not found in the database, returns null.
 * @param txId The transaction ID to check
 * @param log The logging function to use
 * @returns A promise that resolves to a success or failure result if the publication has already been checked, or null otherwise.
 */
const txAlreadyChecked = async (
  txId: string,
  log: LogFunctionType
): PromiseWithContextResultOrNull<
  DAStructurePublication<DAEventType, PublicationTypedData> | void,
  DAStructurePublication<DAEventType, PublicationTypedData>
> => {
  // Check if the transaction ID exists in the database
  const dbResult = await getTxDb(txId);

  if (dbResult) {
    // If the transaction ID is found, log a message and return the corresponding publication
    log('Already checked submission');

    if (dbResult.success) {
      return successWithContext(dbResult.dataAvailabilityResult);
    }

    return failureWithContext(
      (<TxValidatedFailureResult>dbResult).failureReason,
      dbResult.dataAvailabilityResult!
    );
  }

  // If the transaction ID is not found, return null
  return null;
};

/**
 * Validates a data availability proof of a given transaction on the Arweave network, including the timestamp proofs.
 * @param txId The transaction ID to check.
 * @param ethereumNode The Ethereum node to use to validate the data availability proof.
 * @param options The options for validating the data availability proof.
 * @returns A `Promise` that resolves to a `PromiseResult` containing the validated data availability proof, or `void` if the validation fails.
 */
export const checkDAProof = async (
  txId: string,
  ethereumNode: EthereumNode,
  options: CheckDASubmissionOptions = getDefaultCheckDASubmissionOptions
): PromiseWithContextResult<
  DAStructurePublication<DAEventType, PublicationTypedData> | void,
  DAStructurePublication<DAEventType, PublicationTypedData>
> => {
  if (!options.byPassDb) {
    const alreadyChecked = await txAlreadyChecked(txId, options.log);
    if (alreadyChecked) {
      return alreadyChecked;
    }
  }

  return checker.checkDAProof(txId, ethereumNode, options);
};

/**
 * Checks a data availability proof with metadata, including the timestamp proofs and transaction ID.
 * If the proof has already been checked, returns the previous result.
 * If the submitter is invalid, returns an error.
 * Otherwise, runs the internal proof check and returns the result.
 * @param txId The transaction ID associated with the proof.
 * @param daPublicationWithTimestampProofs The data availability publication with associated timestamp proofs.
 * @param ethereumNode The Ethereum node to use for validation.
 * @param options Optional options for the check, including logging and pointer verification.
 * @returns A context result with the validated publication, or an error if validation fails.
 */
export const checkDAProofWithMetadata = async (
  txId: string,
  daPublicationWithTimestampProofs: DAPublicationWithTimestampProofsBatchResult,
  ethereumNode: EthereumNode,
  options: CheckDASubmissionOptions = getDefaultCheckDASubmissionOptions
): PromiseWithContextResult<
  DAStructurePublication<DAEventType, PublicationTypedData> | void,
  DAStructurePublication<DAEventType, PublicationTypedData>
> => {
  if (!options.byPassDb) {
    const alreadyChecked = await txAlreadyChecked(txId, options.log);
    if (alreadyChecked) {
      return alreadyChecked;
    }
  }

  return checker.checkDAProofWithMetadata(
    txId,
    daPublicationWithTimestampProofs,
    ethereumNode,
    options
  );
};
