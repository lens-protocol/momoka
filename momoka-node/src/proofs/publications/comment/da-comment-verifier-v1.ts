import { DAStructurePublication } from '../../../data-availability-models/publications/data-availability-structure-publication';
import { DACommentCreatedEventEmittedResponseV1 } from '../../../data-availability-models/publications/data-availability-structure-publications-events';
import { DAPublicationVerifierV1 } from '../da-publication-verifier-v1';
import { CreateCommentV1EIP712TypedData } from '../../../data-availability-models/publications/data-availability-publication-typed-data';
import { LogFunctionType } from '../../../common/logger';
import { failure, PromiseResult, success } from '../../../data-availability-models/da-result';
import { BigNumber } from 'ethers';
import { MomokaValidatorError } from '../../../data-availability-models/validator-errors';
import { EMPTY_BYTE, EthereumNode } from '../../../evm/ethereum';
import { MomokaActionTypes } from '../../../data-availability-models/data-availability-action-types';

export type DACommentPublicationV1 = DAStructurePublication<
  DACommentCreatedEventEmittedResponseV1,
  CreateCommentV1EIP712TypedData
>;

export const isDACommentPublicationV1 = (
  daPublication: DAStructurePublication
): daPublication is DACommentPublicationV1 => {
  return (
    daPublication.type === MomokaActionTypes.COMMENT_CREATED &&
    !('commentParams' in daPublication.event)
  );
};

export class DACommentVerifierV1 extends DAPublicationVerifierV1 {
  public readonly type = MomokaActionTypes.COMMENT_CREATED;

  constructor(
    public readonly daPublication: DACommentPublicationV1,
    ethereumNode: EthereumNode,
    log: LogFunctionType
  ) {
    super(daPublication, ethereumNode, log);
  }

  public verifyEventWithTypedData(pubCountAtBlock: string): PromiseResult {
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
      typedData.value.profileId !== event.profileId ||
      typedData.value.contentURI !== event.contentURI ||
      typedData.value.profileIdPointed !== event.profileIdPointed ||
      typedData.value.pubIdPointed !== event.pubIdPointed ||
      typedData.value.collectModule !== event.collectModule ||
      event.collectModuleReturnData !== EMPTY_BYTE ||
      typedData.value.referenceModule !== event.referenceModule ||
      event.referenceModuleReturnData !== EMPTY_BYTE ||
      typedData.value.collectModuleInitData !== EMPTY_BYTE ||
      typedData.value.referenceModuleInitData !== EMPTY_BYTE
    ) {
      return Promise.resolve(failure(MomokaValidatorError.EVENT_MISMATCH));
    }

    this.log('cross check event is complete');

    return Promise.resolve(success());
  }
}
