import { DAStructurePublication } from '../../data-availability-models/publications/data-availability-structure-publication';
import { DaPublicationVerifierBase } from './da-publication-verifier-base';
import { DAEventTypeV1 } from '../../data-availability-models/publications/data-availability-structure-publications-events';
import { PublicationV1TypedData } from '../../data-availability-models/publications/data-availability-publication-typed-data';
import { generatePublicationId } from '../utils';
import { PromiseResult } from '../../data-availability-models/da-result';

export abstract class DAPublicationVerifierV1 implements DaPublicationVerifierBase {
  constructor(
    public readonly daPublication: DAStructurePublication<DAEventTypeV1, PublicationV1TypedData>
  ) {}

  verifyPublicationIdMatches(): boolean {
    const generatedPublicationId = generatePublicationId(
      this.daPublication.event.profileId,
      this.daPublication.event.pubId,
      this.daPublication.dataAvailabilityId
    );

    return generatedPublicationId === this.daPublication.publicationId;
  }

  abstract verifyEventWithTypedData(pubCountAtBlock: any): PromiseResult;
}
