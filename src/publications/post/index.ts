import { ClaimableValidatorError } from '../../claimable-validator-errors';
import { getPubCount } from '../../contract-lens/lens-proxy-info';
import { CreatePostEIP712TypedData } from '../../data-availability-models/publications/data-availability-publication-typed-data';
import { DAStructurePublication } from '../../data-availability-models/publications/data-availability-structure-publication';
import { DAPostCreatedEventEmittedResponse } from '../../data-availability-models/publications/data-availability-structure-publications-events';
import { EMPTY_BYTE, executeSimulationTransaction, parseSignature } from '../../ethereum';
import { PostWithSig_DispatcherRequest } from '../../ethereum-abi-types/LensHub';

export type CheckDAPostPublication = DAStructurePublication<
  DAPostCreatedEventEmittedResponse,
  CreatePostEIP712TypedData
>;

const crossCheckEvent = async (
  event: DAPostCreatedEventEmittedResponse,
  typedData: CreatePostEIP712TypedData,
  blockNumber: number,
  log: (message: string, ...optionalParams: any[]) => void
) => {
  // compare all event emitted to typed data value
  log('cross check event with typed data value');

  // check the pub count makes sense from the block!
  const pubCountAtBlock = await getPubCount(typedData.value.profileId, blockNumber);
  log('get pub count at block', pubCountAtBlock.toHexString());
  if (pubCountAtBlock.add(1).toHexString() !== event.pubId) {
    throw new Error(ClaimableValidatorError.EVENT_MISMATCH);
  }

  log('pub count at block is correct');

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

  log('cross check event is complete');
};

export const checkDAPost = async (
  publication: CheckDAPostPublication,
  log: (message: string, ...optionalParams: any[]) => void
) => {
  log('check DA post');

  const sigRequest: PostWithSig_DispatcherRequest = {
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

  log('signature simulation checking!');

  try {
    // check the signature would of passed using eth_call
    await executeSimulationTransaction(
      publication.chainProofs.thisPublication.signedByDelegate
        ? 'postWithSig_Dispatcher'
        : 'postWithSig',
      sigRequest,
      publication.chainProofs.thisPublication.blockNumber
    );
  } catch (error) {
    throw new Error(ClaimableValidatorError.SIMULATION_FAILED);
  }

  log('signature simulation passed!');

  // cross check event and typed data values
  await crossCheckEvent(
    publication.event,
    publication.chainProofs.thisPublication.typedData,
    publication.chainProofs.thisPublication.blockNumber,
    log
  );

  log('finished checking DA post');
};
