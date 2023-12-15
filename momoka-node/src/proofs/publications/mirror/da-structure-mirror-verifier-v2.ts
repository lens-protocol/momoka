import { DAStructurePublication } from '../../../data-availability-models/publications/data-availability-structure-publication';
import { DAMirrorCreatedEventEmittedResponseV2 } from '../../../data-availability-models/publications/data-availability-structure-publications-events';
import { CreateMirrorV2EIP712TypedData } from '../../../data-availability-models/publications/data-availability-publication-typed-data';
import { LogFunctionType } from '../../../common/logger';
import { failure, PromiseResult, success } from '../../../data-availability-models/da-result';
import { BigNumber } from 'ethers';
import { MomokaValidatorError } from '../../../data-availability-models/validator-errors';
import { DAPublicationVerifierV2 } from '../da-publication-verifier-v2';
import { generatePublicationId } from '../../utils';
import { DAActionTypes } from '../../../data-availability-models/data-availability-action-types';
import { EMPTY_BYTE, EthereumNode } from '../../../evm/ethereum';

export type DAMirrorPublicationV2 = DAStructurePublication<
  DAMirrorCreatedEventEmittedResponseV2,
  CreateMirrorV2EIP712TypedData
>;

export const isDAMirrorPublicationV2 = (
  daPublication: DAStructurePublication
): daPublication is DAMirrorPublicationV2 => {
  return (
    daPublication.type === DAActionTypes.MIRROR_CREATED && 'mirrorParams' in daPublication.event
  );
};

export class DAStructureMirrorVerifierV2 extends DAPublicationVerifierV2 {
  public readonly type = DAActionTypes.MIRROR_CREATED;

  constructor(
    public readonly daPublication: DAMirrorPublicationV2,
    ethereumNode: EthereumNode,
    log: LogFunctionType
  ) {
    super(daPublication, ethereumNode, log);
  }

  verifyPublicationIdMatches(): PromiseResult {
    const generatedPublicationId = generatePublicationId(
      this.daPublication.event.mirrorParams.profileId,
      this.daPublication.event.pubId,
      this.daPublication.dataAvailabilityId
    );

    if (generatedPublicationId !== this.daPublication.publicationId) {
      this.log('publicationId does not match the generated one');

      return Promise.resolve(failure(MomokaValidatorError.GENERATED_PUBLICATION_ID_MISMATCH));
    }

    return Promise.resolve(success());
  }

  verifyEventWithTypedData(pubCountAtBlock: string): PromiseResult {
    const event = this.daPublication.event;
    const typedData = this.daPublication.chainProofs.thisPublication.typedData;

    // compare all event emitted to typed data value
    this.log('cross check event with typed data value');

    // check the pub count makes sense from the block!
    if (BigNumber.from(pubCountAtBlock).add(1).toHexString() !== event.pubId) {
      return Promise.resolve(failure(MomokaValidatorError.EVENT_MISMATCH));
    }

    this.log('pub count at block is correct');

    // compare all others!
    // TODO: verify others
    if (
      typedData.value.profileId !== event.mirrorParams.profileId ||
      typedData.value.pointedProfileId !== event.mirrorParams.pointedProfileId ||
      typedData.value.pointedPubId !== event.mirrorParams.pointedPubId ||
      typedData.value.metadataURI !== event.mirrorParams.metadataURI ||
      event.referenceModuleReturnData !== EMPTY_BYTE ||
      typedData.value.referenceModuleData !== EMPTY_BYTE
    ) {
      return Promise.resolve(failure(MomokaValidatorError.EVENT_MISMATCH));
    }

    this.log('cross check event is complete');

    return Promise.resolve(success());
  }
}
