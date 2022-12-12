import { BigNumber, utils } from 'ethers';
import { ClaimableValidatorError } from '../../claimable-validator-errors';
import { CreateMirrorEIP712TypedData } from '../../data-availability-models/publications/data-availability-publication-typed-data';
import {
  DAPublicationPointerType,
  DAStructurePublication,
} from '../../data-availability-models/publications/data-availability-structure-publication';
import { DAMirrorCreatedEventEmittedResponse } from '../../data-availability-models/publications/data-availability-structure-publications-events';
import { EMPTY_BYTE, getOnChainProfileDetails } from '../../ethereum';
import { checkDASubmisson } from '../../main';

export type CheckDAMirrorPublication = DAStructurePublication<
  DAMirrorCreatedEventEmittedResponse,
  CreateMirrorEIP712TypedData
>;

const crossCheckEvent = async (
  event: DAMirrorCreatedEventEmittedResponse,
  typedData: CreateMirrorEIP712TypedData,
  pubCountAtBlock: string
) => {
  // compare all event emitted to typed data value

  // check the pub count makes sense from the block!
  if (BigNumber.from(pubCountAtBlock).add(1).toHexString() !== event.pubId) {
    throw new Error(ClaimableValidatorError.EVENT_MISMATCH);
  }

  // compare all others!
  if (
    typedData.value.profileId !== event.profileId ||
    typedData.value.profileIdPointed !== event.profileIdPointed ||
    typedData.value.pubIdPointed !== event.pubIdPointed ||
    typedData.value.referenceModule !== event.referenceModule ||
    typedData.value.referenceModuleInitData !== EMPTY_BYTE ||
    event.referenceModuleReturnData !== EMPTY_BYTE
  ) {
    throw new Error(ClaimableValidatorError.EVENT_MISMATCH);
  }
};

export const checkDAMirror = async (
  publication: CheckDAMirrorPublication,
  verifyPointer: boolean
) => {
  if (!publication.chainProofs.pointer) {
    throw new Error(ClaimableValidatorError.MIRROR_NO_POINTER);
  }

  if (publication.chainProofs.pointer.type !== DAPublicationPointerType.ON_DA) {
    throw new Error(ClaimableValidatorError.MIRROR_NONE_DA);
  }

  if (verifyPointer) {
    // check the pointer!
    await checkDASubmisson(publication.chainProofs.pointer.location, false);
  }

  const typedData = publication.chainProofs.thisPublication.typedData;

  const whoSigned = utils.verifyTypedData(
    typedData.domain,
    typedData.types,
    typedData.value,
    publication.chainProofs.thisPublication.signature
  );

  const details = await getOnChainProfileDetails(
    publication.chainProofs.thisPublication.blockNumber,
    typedData.value.profileId,
    whoSigned
  );

  if (details.sigNonce !== typedData.value.nonce) {
    throw new Error(ClaimableValidatorError.MIRROR_NONCE_INVALID);
  }

  if (details.dispatcherAddress !== whoSigned && details.ownerOfAddress !== whoSigned) {
    throw new Error(ClaimableValidatorError.MIRROR_SIGNER_NOT_ALLOWED);
  }

  await crossCheckEvent(publication.event, typedData, details.currentPublicationId);
};
