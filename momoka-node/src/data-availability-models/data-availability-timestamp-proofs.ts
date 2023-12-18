import { MomokaActionTypes } from './data-availability-action-types';
import { MomokaProvider } from './data-availability-provider';
import { DAPublicationsBatchResult } from './publications/data-availability-structure-publication';

export type DATimestampProofs = BundlrTimestampProofs;

export interface BundlrUploadResponse {
  // The ID of the transaction
  id: string;
  // The Arweave public key of the node that received the transaction
  public: string;
  // The signature of this receipt
  signature: string;
  // response version
  version: '1.0.0';
  // the maximum expected Arweave block height for transaction inclusion
  block: number;
  deadlineHeight: number;
  // List of validator signatures
  validatorSignatures: { address: string; signature: string }[];
  // The UNIX (MS precision) timestamp of when the node received the Tx. Only optional if the upload receives a `201` error in response to a duplicate transaction upload.
  timestamp: number;
}

export interface BundlrTimestampProofs {
  /**
   * The proofs type
   */
  type: MomokaProvider.BUNDLR;

  /**
   * The hash prefix may not change for 10 years but good to know!
   */
  hashPrefix: '1';
  /**
   * The response from bundlr including the timestamp
   */
  response: BundlrUploadResponse;
}

export interface DATimestampProofsResponse {
  type: MomokaActionTypes;
  dataAvailabilityId: string;
}

export interface DAPublicationWithTimestampProofsBatchResult extends DAPublicationsBatchResult {
  timestampProofsData: DATimestampProofsResponse;
}
