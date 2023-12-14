import { PromiseResult } from '../../data-availability-models/da-result';
import { DAStructurePublication } from '../../data-availability-models/publications/data-availability-structure-publication';

export interface DaPublicationVerifierBase {
  daPublication: DAStructurePublication;
  /**
   * Checks if the publication id generated from the given DAStructurePublication matches the publication id of the same
   * DAStructurePublication.
   * @returns true if the generated publication id matches the publication id of the given DAStructurePublication.
   */
  verifyPublicationIdMatches(): boolean;

  /**
   * Cross-check DA comment event with the typed data value
   * @param pubCountAtBlock - the publication count at the block
   * @returns {PromiseResult} - returns success if the event passes the cross-check, otherwise returns failure with an error
   */
  verifyEventWithTypedData(pubCountAtBlock: string): PromiseResult;
}
