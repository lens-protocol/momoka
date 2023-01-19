import { BigNumber, utils } from 'ethers';
import { ClaimableValidatorError } from '../../claimable-validator-errors';
import { failure, PromiseResult, success } from '../../da-result';
import { CreateCommentEIP712TypedData } from '../../data-availability-models/publications/data-availability-publication-typed-data';
import {
  DAPublicationPointerType,
  DAStructurePublication,
} from '../../data-availability-models/publications/data-availability-structure-publication';
import { DACommentCreatedEventEmittedResponse } from '../../data-availability-models/publications/data-availability-structure-publications-events';
import { EMPTY_BYTE, getOnChainProfileDetails } from '../../ethereum';
import { checkDASubmisson } from '../../main';

export type CheckDACommentPublication = DAStructurePublication<
  DACommentCreatedEventEmittedResponse,
  CreateCommentEIP712TypedData
>;

const crossCheckEvent = async (
  event: DACommentCreatedEventEmittedResponse,
  typedData: CreateCommentEIP712TypedData,
  pubCountAtBlock: string,
  log: (message: string, ...optionalParams: any[]) => void
): PromiseResult => {
  // compare all event emitted to typed data value
  log('cross check event with typed data value');

  // check the pub count makes sense from the block!
  if (BigNumber.from(pubCountAtBlock).add(1).toHexString() !== event.pubId) {
    return failure(ClaimableValidatorError.EVENT_MISMATCH);
  }

  log('pub count at block is correct');

  // compare all others!
  if (
    typedData.value.profileId !== event.profileId ||
    typedData.value.contentURI !== event.contentURI ||
    typedData.value.profileIdPointed !== event.profileIdPointed ||
    typedData.value.pubIdPointed !== event.pubIdPointed ||
    typedData.value.collectModule !== event.collectModule ||
    event.collectModuleReturnData !== EMPTY_BYTE ||
    typedData.value.collectModuleInitData !== EMPTY_BYTE ||
    typedData.value.referenceModule !== event.referenceModule ||
    typedData.value.referenceModuleInitData !== EMPTY_BYTE ||
    event.referenceModuleReturnData !== EMPTY_BYTE
  ) {
    return failure(ClaimableValidatorError.EVENT_MISMATCH);
  }

  log('cross check event is complete');

  return success();
};

export const checkDAComment = async (
  publication: CheckDACommentPublication,
  verifyPointer: boolean,
  log: (message: string, ...optionalParams: any[]) => void
) => {
  log('check DA comment');

  if (!publication.chainProofs.pointer) {
    return failure(ClaimableValidatorError.COMMENT_NO_POINTER);
  }

  if (publication.chainProofs.pointer.type !== DAPublicationPointerType.ON_DA) {
    return failure(ClaimableValidatorError.COMMENT_NONE_DA);
  }

  if (verifyPointer) {
    log('verify pointer first');

    // check the pointer!
    const pointerResult = await checkDASubmisson(publication.chainProofs.pointer.location, false);
    if (pointerResult.isFailure()) {
      return pointerResult;
    }
  }

  const typedData = publication.chainProofs.thisPublication.typedData;

  log('typed data - domain', typedData.domain);
  log('typed data - types', typedData.types);
  log('typed data - value', typedData.value);
  log('typed data - signature', publication.chainProofs.thisPublication.signature);

  const whoSigned = utils.verifyTypedData(
    typedData.domain,
    typedData.types,
    typedData.value,
    publication.chainProofs.thisPublication.signature
  );
  log('who signed', whoSigned);

  const details = await getOnChainProfileDetails(
    publication.chainProofs.thisPublication.blockNumber,
    typedData.value.profileId,
    whoSigned
  );

  if (details.sigNonce !== typedData.value.nonce) {
    log('nonce mismatch', { expected: details.sigNonce, actual: typedData.value.nonce });
    return failure(ClaimableValidatorError.COMMENT_NONCE_INVALID);
  }

  if (details.dispatcherAddress !== whoSigned && details.ownerOfAddress !== whoSigned) {
    return failure(ClaimableValidatorError.COMMENT_SIGNER_NOT_ALLOWED);
  }

  const eventResult = await crossCheckEvent(
    publication.event,
    typedData,
    details.currentPublicationId,
    log
  );

  log('finished checking DA comment');

  return eventResult;
};
