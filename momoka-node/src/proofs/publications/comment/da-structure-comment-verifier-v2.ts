import { DAStructurePublication } from '../../../data-availability-models/publications/data-availability-structure-publication';
import { DACommentCreatedEventEmittedResponseV2 } from '../../../data-availability-models/publications/data-availability-structure-publications-events';
import { CreateCommentV2EIP712TypedData } from '../../../data-availability-models/publications/data-availability-publication-typed-data';
import { LogFunctionType } from '../../../common/logger';
import { failure, PromiseResult, success } from '../../../data-availability-models/da-result';
import { BigNumber } from 'ethers';
import { MomokaValidatorError } from '../../../data-availability-models/validator-errors';
import { DAPublicationVerifierV2 } from '../da-publication-verifier-v2';
import { generatePublicationId } from '../../utils';
import { DAActionTypes } from '../../../data-availability-models/data-availability-action-types';
import { EMPTY_BYTE, EthereumNode } from '../../../evm/ethereum';
import { arraysEqual } from '../../../utils/arrays-equal';

export type DACommentPublicationV2 = DAStructurePublication<
  DACommentCreatedEventEmittedResponseV2,
  CreateCommentV2EIP712TypedData
>;

export const isDACommentPublicationV2 = (
  daPublication: DAStructurePublication
): daPublication is DACommentPublicationV2 => {
  return (
    daPublication.type === DAActionTypes.COMMENT_CREATED && 'commentParams' in daPublication.event
  );
};

export class DAStructureCommentVerifierV2 extends DAPublicationVerifierV2 {
  public readonly type = DAActionTypes.COMMENT_CREATED;

  constructor(
    public readonly daPublication: DACommentPublicationV2,
    ethereumNode: EthereumNode,
    log: LogFunctionType
  ) {
    super(daPublication, ethereumNode, log);
  }

  verifyPublicationIdMatches(): PromiseResult {
    const generatedPublicationId = generatePublicationId(
      this.daPublication.event.commentParams.profileId,
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
    if (
      typedData.value.profileId !== event.commentParams.profileId ||
      typedData.value.contentURI !== event.commentParams.contentURI ||
      typedData.value.pointedProfileId !== event.commentParams.pointedProfileId ||
      typedData.value.pointedPubId !== event.commentParams.pointedPubId ||
      !arraysEqual(typedData.value.actionModules, event.commentParams.actionModules) ||
      !arraysEqual(
        typedData.value.actionModulesInitDatas,
        event.commentParams.actionModulesInitDatas
      ) ||
      typedData.value.referenceModule !== event.commentParams.referenceModule ||
      typedData.value.referenceModuleInitData !== event.commentParams.referenceModuleInitData ||
      !arraysEqual(typedData.value.referrerProfileIds, event.commentParams.referrerProfileIds) ||
      !arraysEqual(typedData.value.referrerPubIds, event.commentParams.referrerPubIds) ||
      event.actionModulesInitReturnDatas.length !== 0 ||
      event.referenceModuleReturnData !== EMPTY_BYTE ||
      event.referenceModuleInitReturnData !== EMPTY_BYTE
    ) {
      return Promise.resolve(failure(MomokaValidatorError.EVENT_MISMATCH));
    }

    this.log('cross check event is complete');

    return Promise.resolve(success());
  }
}
