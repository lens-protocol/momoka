import { BigNumber } from 'ethers';
import { ClaimableValidatorError } from '../../claimable-validator-errors';
import { DAlensHubInterface, getPubCount } from '../../contract-lens/lens-proxy-info';
import { failure, PromiseResult, Result, success } from '../../da-result';
import { CreatePostEIP712TypedData } from '../../data-availability-models/publications/data-availability-publication-typed-data';
import { DAStructurePublication } from '../../data-availability-models/publications/data-availability-structure-publication';
import { DAPostCreatedEventEmittedResponse } from '../../data-availability-models/publications/data-availability-structure-publications-events';
import {
  EMPTY_BYTE,
  EthereumNode,
  executeSimulationTransaction,
  parseSignature,
} from '../../ethereum';
import { PostWithSig_DispatcherRequest } from '../../ethereum-abi-types/LensHub';

export type CheckDAPostPublication = DAStructurePublication<
  DAPostCreatedEventEmittedResponse,
  CreatePostEIP712TypedData
>;

const crossCheckEvent = async (
  event: DAPostCreatedEventEmittedResponse,
  simulatedPubResult: BigNumber,
  typedData: CreatePostEIP712TypedData,
  log: (message: string, ...optionalParams: any[]) => void
): PromiseResult => {
  // compare all event emitted to typed data value
  log('cross check event with typed data value');

  // compare all others!
  if (
    !simulatedPubResult.eq(event.pubId) ||
    typedData.value.profileId !== event.profileId ||
    typedData.value.contentURI !== event.contentURI ||
    typedData.value.collectModule !== event.collectModule ||
    event.collectModuleReturnData !== EMPTY_BYTE ||
    typedData.value.referenceModule !== event.referenceModule ||
    event.referenceModuleReturnData !== EMPTY_BYTE
  ) {
    return failure(ClaimableValidatorError.EVENT_MISMATCH);
  }

  log('cross check event is complete');

  return success();
};

const generateSimulationData = (
  signedByDelegate: boolean,
  sigRequest: PostWithSig_DispatcherRequest
): Result<string | void> => {
  try {
    const result = DAlensHubInterface.encodeFunctionData(
      signedByDelegate ? 'postWithSig_Dispatcher' : 'postWithSig',
      [sigRequest]
    );

    return success(result);
  } catch (e) {
    return failure(ClaimableValidatorError.INVALID_FORMATTED_TYPED_DATA);
  }
};

const getExpectedResult = async (
  profileId: string,
  blockNumber: number,
  ethereumNode: EthereumNode
) => {
  const publicationCount = await getPubCount(profileId, blockNumber, ethereumNode);
  return publicationCount.add(1);
};

export const checkDAPost = async (
  publication: CheckDAPostPublication,
  ethereumNode: EthereumNode,
  log: (message: string, ...optionalParams: any[]) => void
): PromiseResult => {
  log('check DA post');

  // VALIDATE THE TYPED DATA WHAT IS ALLOWED AND NOT!!!!!!!!!!!!
  // typedData.value.collectModuleInitData !== EMPTY_BYTE ||
  // typedData.value.referenceModuleInitData !== EMPTY_BYTE ||

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

  log('signature simulation checking!', sigRequest);

  const simulationData = generateSimulationData(
    publication.chainProofs.thisPublication.signedByDelegate,
    sigRequest
  );

  if (simulationData.isFailure()) {
    return failure(simulationData.failure!);
  }

  // check the signature would of passed using eth_call
  const [simulatedResult, expectedResult] = await Promise.all([
    executeSimulationTransaction(
      simulationData.successResult!,
      publication.chainProofs.thisPublication.blockNumber,
      ethereumNode
    ),
    getExpectedResult(
      publication.chainProofs.thisPublication.typedData.value.profileId,
      publication.chainProofs.thisPublication.blockNumber,
      ethereumNode
    ),
  ]);

  if (simulatedResult.isFailure()) {
    log('signature simulation checking failed');
    return failure(simulationData.failure!);
  }

  if (!expectedResult.eq(simulatedResult.successResult!)) {
    log('signature simulation checking failed');
    return failure(ClaimableValidatorError.SIMULATION_FAILED);
  }

  log('signature simulation passed!');

  // cross check event and typed data values
  const eventResult = await crossCheckEvent(
    publication.event,
    BigNumber.from(simulatedResult.successResult!),
    publication.chainProofs.thisPublication.typedData,
    log
  );

  log('finished checking DA post');

  return eventResult;
};
