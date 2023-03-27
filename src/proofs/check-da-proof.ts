import { EthereumNode } from '../evm/ethereum';
import {
  CheckDASubmissionOptions,
  getDefaultCheckDASubmissionOptions,
} from './models/check-da-submisson-options';
import { PromiseWithContextResult } from '../data-availability-models/da-result';
import {
  DAEventType,
  DAStructurePublication,
  PublicationTypedData,
} from '../data-availability-models/publications/data-availability-structure-publication';
import { DaProofVerifier } from './da-proof-verifier';
import { DaProofChecker } from './da-proof-checker';
import { DAPublicationWithTimestampProofsBatchResult } from '../data-availability-models/data-availability-timestamp-proofs';
import { DaProofGateway } from './da-proof-gateway';

const gateway = new DaProofGateway();
const verifier = new DaProofVerifier();
const checker = new DaProofChecker(verifier, gateway);

/**
 * Validates a data availability proof of a given transaction on the Arweave network, including the timestamp proofs.
 * @param txId The transaction ID to check.
 * @param ethereumNode The Ethereum node to use to validate the data availability proof.
 * @param options The options for validating the data availability proof.
 * @returns A `Promise` that resolves to a `PromiseResult` containing the validated data availability proof, or `void` if the validation fails.
 */
export const checkDAProof = (
  txId: string,
  ethereumNode: EthereumNode,
  options: CheckDASubmissionOptions = getDefaultCheckDASubmissionOptions
): PromiseWithContextResult<
  DAStructurePublication<DAEventType, PublicationTypedData> | void,
  DAStructurePublication<DAEventType, PublicationTypedData>
> => {
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
export const checkDAProofWithMetadata = (
  txId: string,
  daPublicationWithTimestampProofs: DAPublicationWithTimestampProofsBatchResult,
  ethereumNode: EthereumNode,
  options: CheckDASubmissionOptions = getDefaultCheckDASubmissionOptions
): PromiseWithContextResult<
  DAStructurePublication<DAEventType, PublicationTypedData>,
  DAStructurePublication<DAEventType, PublicationTypedData>
> => {
  return checker.checkDAProofWithMetadata(
    txId,
    daPublicationWithTimestampProofs,
    ethereumNode,
    options
  );
};
