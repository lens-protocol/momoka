import { DAStructurePublication } from '../../../data-availability-models/publications/data-availability-structure-publication';
import { DAPostCreatedEventEmittedResponseV1 } from '../../../data-availability-models/publications/data-availability-structure-publications-events';
import { DAPublicationVerifierV1 } from '../da-publication-verifier-v1';
import { CreatePostV1EIP712TypedData } from '../../../data-availability-models/publications/data-availability-publication-typed-data';
import { LogFunctionType } from '../../../common/logger';
import { failure, PromiseResult, success } from '../../../data-availability-models/da-result';
import { BigNumber } from 'ethers';
import { MomokaValidatorError } from '../../../data-availability-models/validator-errors';
import {
  blockHashExists,
  EMPTY_BYTE,
  EthereumNode,
  executeSimulationTransaction,
  parseSignature,
} from '../../../evm/ethereum';
import { DAActionTypes } from '../../../data-availability-models/data-availability-action-types';
import { PostWithSig_DispatcherRequest } from '../../../evm/abi-types/LensHubV1';

export type DAPostPublicationV1 = DAStructurePublication<
  DAPostCreatedEventEmittedResponseV1,
  CreatePostV1EIP712TypedData
>;

export const isDAPostPublicationV1 = (
  daPublication: DAStructurePublication
): daPublication is DAPostPublicationV1 => {
  return (
    daPublication.type === DAActionTypes.POST_CREATED && !('postParams' in daPublication.event)
  );
};

export class DAPostVerifierV1 extends DAPublicationVerifierV1 {
  public readonly type = DAActionTypes.POST_CREATED;

  constructor(
    public readonly daPublication: DAPostPublicationV1,
    ethereumNode: EthereumNode,
    log: LogFunctionType
  ) {
    super(daPublication, ethereumNode, log);
  }

  async verifySimulation(): PromiseResult<string> {
    const publication = this.daPublication;

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

    this.log('signature simulation checking!', sigRequest);

    const simulationData = await this.lensHubGateway.generatePostSimulationData(
      publication.chainProofs.thisPublication.signedByDelegate,
      sigRequest
    );

    if (simulationData.isFailure()) {
      return failure(simulationData.failure);
    }

    // check the signature would of passed using eth_call
    const [simulatedResult, expectedResult] = await Promise.all([
      executeSimulationTransaction(
        simulationData.successResult,
        publication.chainProofs.thisPublication.blockNumber,
        this.ethereumNode
      ),
      this.getExpectedResult(
        publication.chainProofs.thisPublication.typedData.value.profileId,
        publication.chainProofs.thisPublication.blockNumber
      ),
    ]);

    if (simulatedResult.isFailure()) {
      this.log('signature simulation checking failed');
      return failure(simulatedResult.failure);
    }

    if (expectedResult.isFailure()) {
      this.log('expectedResult failed to be fetched');
      return failure(expectedResult.failure);
    }

    if (!expectedResult.successResult.eq(simulatedResult.successResult)) {
      // recheck for `POTENTIAL_REORG`
      const exists = await blockHashExists(
        publication.chainProofs.thisPublication.blockHash,
        this.ethereumNode
      );
      if (!exists) {
        this.log('block hash now does not exist this could be a potential reorg');
        return failure(MomokaValidatorError.POTENTIAL_REORG);
      }

      this.log('signature simulation checking failed');
      return failure(MomokaValidatorError.SIMULATION_FAILED);
    }

    this.log('signature simulation passed!');

    return success(simulatedResult.successResult);
  }

  verifyEventWithTypedData(simulatedPubResult: string): PromiseResult {
    const event = this.daPublication.event;
    const typedData = this.daPublication.chainProofs.thisPublication.typedData;

    // compare all event emitted to typed data value
    this.log('cross check event with typed data value');

    // compare all others!
    if (
      !BigNumber.from(simulatedPubResult).eq(event.pubId) ||
      typedData.value.profileId !== event.profileId ||
      typedData.value.contentURI !== event.contentURI ||
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

  /**
   * Expected result of simulation
   * @param profileId The profile id
   * @param blockNumber The block number
   * @returns The expected result
   */
  private async getExpectedResult(
    profileId: string,
    blockNumber: number
  ): PromiseResult<BigNumber> {
    const publicationCount = await this.lensHubGateway.getLensPubCount(profileId, blockNumber);
    if (publicationCount.isFailure()) {
      return failure(publicationCount.failure);
    }

    return success(publicationCount.successResult.add(1));
  }
}
