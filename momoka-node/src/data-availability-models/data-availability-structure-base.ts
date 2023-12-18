import { MomokaActionTypes } from './data-availability-action-types';
import { DATimestampProofs } from './data-availability-timestamp-proofs';

export interface DAStructureBase {
  /**
   * The ID which links all the other proofs together
   */
  dataAvailabilityId: string;

  /**
   * The signature of the entire payload by the submitter
   */
  signature: string;

  /**
   * The DA action type
   */
  type: MomokaActionTypes;

  /**
   * The timestamp proofs
   */
  timestampProofs: DATimestampProofs;
}
