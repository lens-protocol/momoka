import { BigNumber } from 'ethers';
import { LogFunctionType } from '../../common/logger';
import { ClaimableValidatorError } from '../../data-availability-models/claimable-validator-errors';
import { failure, PromiseResult, Result, success } from '../../data-availability-models/da-result';
import { CreatePostEIP712TypedData } from '../../data-availability-models/publications/data-availability-publication-typed-data';
import { DAStructurePublication } from '../../data-availability-models/publications/data-availability-structure-publication';
import { DAPostCreatedEventEmittedResponse } from '../../data-availability-models/publications/data-availability-structure-publications-events';
import { PostWithSig_DispatcherRequest } from '../../evm/abi-types/LensHub';
import { DAlensHubInterface, getPubCount } from '../../evm/contract-lens/lens-proxy-info';
import {
  EMPTY_BYTE,
  EthereumNode,
  executeSimulationTransaction,
  parseSignature,
} from '../../evm/ethereum';

export type CheckDAPostPublication = DAStructurePublication<
  DAPostCreatedEventEmittedResponse,
  CreatePostEIP712TypedData
>;

/**
 * Cross check DA post event with the typed data value
 * @param event - the event to be cross-checked
 * @param typedData - the typed data to be compared with the event value
 * @param pubCountAtBlock - the publication count at the block
 * @param log - logging function to display the message
 * @returns {PromiseResult} - returns success if the event passes the cross-check, otherwise returns failure with an error
 */
const crossCheckEvent = async (
  event: DAPostCreatedEventEmittedResponse,
  simulatedPubResult: BigNumber,
  typedData: CreatePostEIP712TypedData,
  log: LogFunctionType
): PromiseResult => {
  // compare all event emitted to typed data value
  log('cross check event with typed data value');

  if (
    !simulatedPubResult.eq(event.pubId) ||
    typedData.value.profileId !== event.profileId ||
    typedData.value.contentURI !== event.contentURI ||
    typedData.value.collectModule !== event.collectModule ||
    event.collectModuleReturnData !== EMPTY_BYTE ||
    typedData.value.referenceModule !== event.referenceModule ||
    event.referenceModuleReturnData !== EMPTY_BYTE ||
    typedData.value.collectModuleInitData !== EMPTY_BYTE ||
    typedData.value.referenceModuleInitData !== EMPTY_BYTE
  ) {
    return failure(ClaimableValidatorError.EVENT_MISMATCH);
  }

  log('cross check event is complete');

  return success();
};

/**
 * Generates simulation data for the postWithSig or postWithSig_Dispatcher function of the DAlens Hub contract.
 * @param signedByDelegate - Indicates whether the signature was signed by the delegate.
 * @param sigRequest - The signature request.
 * @returns The simulation data or an error result.
 */
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

/**
 * Expected result of simulation
 * @param profileId The profile id
 * @param blockNumber The block number
 * @param ethereumNode The ethereum node
 * @returns The expected result
 */
const getExpectedResult = async (
  profileId: string,
  blockNumber: number,
  ethereumNode: EthereumNode
): Promise<BigNumber> => {
  const publicationCount = await getPubCount(profileId, blockNumber, ethereumNode);
  return publicationCount.add(1);
};

/**
 * Checks if the given DAPostPublication is valid by verifying the proof chain, cross-checking against the event, and
 * validating the signature.
 * @param publication The DAPostPublication to check.
 * @param ethereumNode The EthereumNode to use for fetching data from the Ethereum blockchain.
 * @param log A function used for logging output.
 * @returns A PromiseResult indicating success or failure, along with an optional error message.
 */
export const checkDAPost = async (
  publication: CheckDAPostPublication,
  ethereumNode: EthereumNode,
  log: LogFunctionType
): PromiseResult => {
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
