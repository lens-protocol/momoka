import { DAActionTypes } from './data-availability-action-types';
import { DATimestampProofs } from './data-availability-timestamp-proofs';

export interface DAStructureBase {
  /**
   * The ID which links all the other proofs together
   */
  dataAvailabilityId: string;

  /**
   * The DA action type
   */
  type: DAActionTypes;

  /**
   * The timestamp proofs
   */
  timestampProofs: DATimestampProofs;
}
