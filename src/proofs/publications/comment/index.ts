import { BigNumber } from 'ethers';
import { LogFunctionType } from '../../../common/logger';
import { ClaimableValidatorError } from '../../../data-availability-models/claimable-validator-errors';
import { failure, PromiseResult, success } from '../../../data-availability-models/da-result';
import { CreateCommentEIP712TypedData } from '../../../data-availability-models/publications/data-availability-publication-typed-data';
import {
  DAPublicationPointerType,
  DAStructurePublication,
} from '../../../data-availability-models/publications/data-availability-structure-publication';
import { DACommentCreatedEventEmittedResponse } from '../../../data-availability-models/publications/data-availability-structure-publications-events';
import { EMPTY_BYTE, EthereumNode, getOnChainProfileDetails } from '../../../evm/ethereum';
import { DaProofChecker } from '../../da-proof-checker';
import { whoSignedTypedData } from '../publication.base';

export type CheckDACommentPublication = DAStructurePublication<
  DACommentCreatedEventEmittedResponse,
  CreateCommentEIP712TypedData
>;

/**
 * Cross check DA comment event with the typed data value
 * @param event - the event to be cross-checked
 * @param typedData - the typed data to be compared with the event value
 * @param pubCountAtBlock - the publication count at the block
 * @param log - logging function to display the message
 * @returns {PromiseResult} - returns success if the event passes the cross-check, otherwise returns failure with an error
 */
const crossCheckEvent = async (
  event: DACommentCreatedEventEmittedResponse,
  typedData: CreateCommentEIP712TypedData,
  pubCountAtBlock: string,
  log: LogFunctionType
): PromiseResult => {
  // compare all event emitted to typed data value
  log('cross check event with typed data value');

  // check the pub count makes sense from the block!
  if (BigNumber.from(pubCountAtBlock).add(1).toHexString() !== event.pubId) {
    return await Promise.resolve(failure(ClaimableValidatorError.EVENT_MISMATCH));
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
    typedData.value.referenceModule !== event.referenceModule ||
    event.referenceModuleReturnData !== EMPTY_BYTE ||
    typedData.value.collectModuleInitData !== EMPTY_BYTE ||
    typedData.value.referenceModuleInitData !== EMPTY_BYTE
  ) {
    return await Promise.resolve(failure(ClaimableValidatorError.EVENT_MISMATCH));
  }

  log('cross check event is complete');

  return await Promise.resolve(success());
};

/**
 * Checks if the given DACommentPublication is valid by verifying the proof chain, cross-checking against the event, and
 * validating the signature.
 * @param publication The DACommentPublication to check.
 * @param verifyPointer If true, the pointer chain will be verified before checking the publication.
 * @param ethereumNode The EthereumNode to use for fetching data from the Ethereum blockchain.
 * @param log A function used for logging output.
 * @param checker The DAProofChecker to use for checking the proof.
 * @returns A PromiseResult indicating success or failure, along with an optional error message.
 */
export const checkDAComment = async (
  publication: CheckDACommentPublication,
  verifyPointer: boolean,
  ethereumNode: EthereumNode,
  log: LogFunctionType,
  checker: DaProofChecker
): PromiseResult => {
  log('check DA comment');

  if (!publication.chainProofs.pointer) {
    return failure(ClaimableValidatorError.PUBLICATION_NO_POINTER);
  }

  if (publication.chainProofs.pointer.type !== DAPublicationPointerType.ON_DA) {
    return failure(ClaimableValidatorError.PUBLICATION_NONE_DA);
  }

  if (verifyPointer) {
    log('verify pointer first');

    // check the pointer!
    const pointerResult = await checker.checkDAProof(
      publication.chainProofs.pointer.location,
      ethereumNode,
      {
        byPassDb: false,
        verifyPointer: false,
        log,
      }
    );
    if (pointerResult.isFailure()) {
      return failure(ClaimableValidatorError.POINTER_FAILED_VERIFICATION);
    }
  }

  const typedData = publication.chainProofs.thisPublication.typedData;

  const whoSignedResult = await whoSignedTypedData(
    typedData.domain,
    typedData.types,
    typedData.value,
    publication.chainProofs.thisPublication.signature
  );

  if (whoSignedResult.isFailure()) {
    return failure(whoSignedResult.failure!);
  }

  const whoSigned = whoSignedResult.successResult!;

  log('who signed', whoSigned);

  const chainProfileDetailsResult = await getOnChainProfileDetails(
    publication.chainProofs.thisPublication.blockNumber,
    typedData.value.profileId,
    whoSigned,
    ethereumNode
  );
  if (chainProfileDetailsResult.isFailure()) {
    return failure(chainProfileDetailsResult.failure!);
  }

  const details = chainProfileDetailsResult.successResult!;

  if (details.sigNonce !== typedData.value.nonce) {
    log('nonce mismatch', { expected: details.sigNonce, actual: typedData.value.nonce });
    return failure(ClaimableValidatorError.PUBLICATION_NONCE_INVALID);
  }

  if (details.dispatcherAddress !== whoSigned && details.ownerOfAddress !== whoSigned) {
    return failure(ClaimableValidatorError.PUBLICATION_SIGNER_NOT_ALLOWED);
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
