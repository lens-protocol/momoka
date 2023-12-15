import { DAStructurePublication } from '../../../data-availability-models/publications/data-availability-structure-publication';
import { DAPostCreatedEventEmittedResponseV2 } from '../../../data-availability-models/publications/data-availability-structure-publications-events';
import { CreatePostV2EIP712TypedData } from '../../../data-availability-models/publications/data-availability-publication-typed-data';
import { LogFunctionType } from '../../../common/logger';
import { failure, PromiseResult, success } from '../../../data-availability-models/da-result';
import { BigNumber } from 'ethers';
import { MomokaValidatorError } from '../../../data-availability-models/validator-errors';
import { DAActionTypes } from '../../../data-availability-models/data-availability-action-types';
import {
  blockHashExists,
  EMPTY_BYTE,
  EthereumNode,
  executeSimulationTransaction,
  parseSignature,
} from '../../../evm/ethereum';
import { PostParamsRequest } from '../../../evm/abi-types/LensHubV2';
import { whoSignedTypedData } from '../publication.base';
import { arraysEqual } from '../../../utils/arrays-equal';
import { DAPublicationVerifierV2 } from '../da-publication-verifier-v2';
import { generatePublicationId } from '../../utils';

export type DAPostPublicationV2 = DAStructurePublication<
  DAPostCreatedEventEmittedResponseV2,
  CreatePostV2EIP712TypedData
>;

export const isDAPostPublicationV2 = (
  daPublication: DAStructurePublication
): daPublication is DAPostPublicationV2 => {
  return daPublication.type === DAActionTypes.POST_CREATED && 'postParams' in daPublication.event;
};

export class DAStructurePostVerifierV2 extends DAPublicationVerifierV2 {
  public readonly type = DAActionTypes.POST_CREATED;

  constructor(
    public readonly daPublication: DAPostPublicationV2,
    ethereumNode: EthereumNode,
    log: LogFunctionType
  ) {
    super(daPublication, ethereumNode, log);
  }

  // todo return promise result
  verifyPublicationIdMatches(): boolean {
    const generatedPublicationId = generatePublicationId(
      this.daPublication.event.postParams.profileId,
      this.daPublication.event.pubId,
      this.daPublication.dataAvailabilityId
    );

    return generatedPublicationId === this.daPublication.publicationId;
  }

  async verifySimulation(): PromiseResult<string> {
    const publication = this.daPublication;

    const whoSignedResult = await whoSignedTypedData(
      publication.chainProofs.thisPublication.typedData.domain,
      publication.chainProofs.thisPublication.typedData.types,
      publication.chainProofs.thisPublication.typedData.value,
      publication.chainProofs.thisPublication.signature
    );

    if (whoSignedResult.isFailure()) {
      return failure(whoSignedResult.failure);
    }

    const whoSigned = whoSignedResult.successResult;

    this.log('who signed', whoSigned);

    const sigRequest: PostParamsRequest = {
      profileId: publication.chainProofs.thisPublication.typedData.value.profileId,
      contentURI: publication.chainProofs.thisPublication.typedData.value.contentURI,
      actionModules: publication.chainProofs.thisPublication.typedData.value.actionModules,
      actionModulesInitDatas:
        publication.chainProofs.thisPublication.typedData.value.actionModulesInitDatas,
      referenceModule: publication.chainProofs.thisPublication.typedData.value.referenceModule,
      referenceModuleInitData:
        publication.chainProofs.thisPublication.typedData.value.referenceModuleInitData,
    };

    const signature = parseSignature(
      publication.chainProofs.thisPublication.signature,
      publication.chainProofs.thisPublication.typedData.value.deadline
    );

    this.log('signature simulation checking!', sigRequest);

    const simulationData = await this.lensHubGateway.generatePostSimulationData(sigRequest, {
      ...signature,
      signer: whoSigned,
    });

    if (simulationData.isFailure()) {
      return failure(simulationData.failure);
    }

    // check the signature would of passed using eth_call
    const [expectedResult] = await Promise.all([
      this.getExpectedResult(
        publication.chainProofs.thisPublication.typedData.value.profileId,
        publication.chainProofs.thisPublication.blockNumber
      ),
    ]);

    // check the signature would of passed using eth_call
    const [simulatedResult] = await Promise.all([
      executeSimulationTransaction(
        simulationData.successResult,
        publication.chainProofs.thisPublication.blockNumber,
        this.ethereumNode
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
    // TODO: verify others
    if (
      !BigNumber.from(simulatedPubResult).eq(event.pubId) ||
      typedData.value.profileId !== event.postParams.profileId ||
      typedData.value.contentURI !== event.postParams.contentURI ||
      !arraysEqual(typedData.value.actionModules, event.postParams.actionModules) ||
      typedData.value.referenceModule !== event.postParams.referenceModule ||
      event.referenceModuleInitReturnData !== EMPTY_BYTE ||
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
