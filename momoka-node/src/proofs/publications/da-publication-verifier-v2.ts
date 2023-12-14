import { DaPublicationVerifierBase } from './da-publication-verifier-base';
import { PromiseResult } from '../../data-availability-models/da-result';
import { DAEventTypeV2 } from '../../data-availability-models/publications/data-availability-structure-publications-events';
import { PublicationV2TypedData } from '../../data-availability-models/publications/data-availability-publication-typed-data';
import { DAStructurePublication } from '../../data-availability-models/publications/data-availability-structure-publication';

export abstract class DAPublicationVerifierV2 implements DaPublicationVerifierBase {
  constructor(
    public readonly daPublication: DAStructurePublication<DAEventTypeV2, PublicationV2TypedData>
  ) {}
  abstract verifyPublicationIdMatches(): boolean;
  abstract verifyEventWithTypedData(pubCountAtBlock: string): PromiseResult;
}
