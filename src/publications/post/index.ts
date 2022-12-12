import { ClaimableValidatorError } from '../../claimable-validator-errors';
import { CreatePostEIP712TypedData } from '../../data-availability-models/publications/data-availability-publication-typed-data';
import { DAStructurePublication } from '../../data-availability-models/publications/data-availability-structure-publication';
import { DAPostCreatedEventEmittedResponse } from '../../data-availability-models/publications/data-availability-structure-publications-events';
import { EMPTY_BYTE, executeSimulationTransaction, parseSignature } from '../../ethereum';
import { PostWithSigRequest } from '../../ethereum-abi-types/LensHub';
import { getPubCount } from '../../lens-proxy-info';

export type CheckDAPostPublication = DAStructurePublication<
  DAPostCreatedEventEmittedResponse,
  CreatePostEIP712TypedData
>;

const crossCheckEvent = async (
  event: DAPostCreatedEventEmittedResponse,
  typedData: CreatePostEIP712TypedData,
  blockNumber: number
) => {
  // compare all event emitted to typed data value

  // check the pub count makes sense from the block!
  const pubCountAtBlock = await getPubCount(typedData.value.profileId, blockNumber);
  if (pubCountAtBlock.add(1).toHexString() !== event.pubId) {
    throw new Error(ClaimableValidatorError.EVENT_MISMATCH);
  }

  // compare all others!
  if (
    typedData.value.profileId !== event.profileId ||
    typedData.value.contentURI !== event.contentURI ||
    typedData.value.collectModule !== event.collectModule ||
    event.collectModuleReturnData !== EMPTY_BYTE ||
    typedData.value.collectModuleInitData !== EMPTY_BYTE ||
    typedData.value.referenceModule !== event.referenceModule ||
    typedData.value.referenceModuleInitData !== EMPTY_BYTE ||
    event.referenceModuleReturnData !== EMPTY_BYTE
  ) {
    throw new Error(ClaimableValidatorError.EVENT_MISMATCH);
  }
};

export const checkDAPost = async (publication: CheckDAPostPublication) => {
  const sigRequest: PostWithSigRequest = {
    profileId: publication.chainProofs.thisPublication.typedData.value.profileId,
    contentURI: publication.chainProofs.thisPublication.typedData.value.contentURI,
    collectModule: publication.chainProofs.thisPublication.typedData.value.collectModule,
    collectModuleInitData:
      publication.chainProofs.thisPublication.typedData.value.collectModuleInitData,
    referenceModule: publication.chainProofs.thisPublication.typedData.value.referenceModule,
    referenceModuleInitData:
      publication.chainProofs.thisPublication.typedData.value.referenceModuleInitData,
    sig: parseSignature(
      publication.chainProofs.thisPublication.signature,
      publication.chainProofs.thisPublication.typedData.value.deadline
    ),
  };

  try {
    // check the signature would of passed using eth_call
    await executeSimulationTransaction(
      'postWithSig',
      sigRequest,
      publication.chainProofs.thisPublication.blockNumber
    );
  } catch (error) {
    throw new Error(ClaimableValidatorError.SIMULATION_REJECTED);
  }

  // cross check event and typed data values
  await crossCheckEvent(
    publication.event,
    publication.chainProofs.thisPublication.typedData,
    publication.chainProofs.thisPublication.blockNumber
  );
};
