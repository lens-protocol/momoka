import { DAStructurePublication } from '../../data-availability-models/publications/data-availability-structure-publication';
import { DAEventTypeV1 } from '../../data-availability-models/publications/data-availability-structure-publications-events';
import { PublicationV1TypedData } from '../../data-availability-models/publications/data-availability-publication-typed-data';
import { generatePublicationId } from '../utils';
import { failure, PromiseResult, success } from '../../data-availability-models/da-result';
import { whoSignedTypedData } from './publication.base';
import { MomokaValidatorError } from '../../data-availability-models/validator-errors';
import { LensHubV1Gateway } from '../../evm/gateway/LensHubV1Gateway';
import { EthereumNode } from '../../evm/ethereum';
import { LogFunctionType } from '../../common/logger';

export abstract class DAPublicationVerifierV1 {
  protected readonly lensHubGateway: LensHubV1Gateway;

  constructor(
    public readonly daPublication: DAStructurePublication<DAEventTypeV1, PublicationV1TypedData>,
    protected readonly ethereumNode: EthereumNode,
    protected readonly log: LogFunctionType
  ) {
    this.lensHubGateway = new LensHubV1Gateway(ethereumNode);
  }

  public verifyPublicationIdMatches(): boolean {
    const generatedPublicationId = generatePublicationId(
      this.daPublication.event.profileId,
      this.daPublication.event.pubId,
      this.daPublication.dataAvailabilityId
    );

    return generatedPublicationId === this.daPublication.publicationId;
  }

  public async verifySigner(): PromiseResult<{
    currentPublicationId: string;
    ownerOfAddress: string;
  }> {
    const typedData = this.daPublication.chainProofs.thisPublication.typedData;

    const whoSignedResult = await whoSignedTypedData(
      typedData.domain,
      typedData.types,
      typedData.value,
      this.daPublication.chainProofs.thisPublication.signature
    );

    if (whoSignedResult.isFailure()) {
      return failure(whoSignedResult.failure);
    }

    const whoSigned = whoSignedResult.successResult;

    this.log('who signed', whoSigned);

    const chainProfileDetailsResult = await this.lensHubGateway.getOnChainProfileDetails(
      this.daPublication.chainProofs.thisPublication.blockNumber,
      typedData.value.profileId,
      whoSigned
    );
    if (chainProfileDetailsResult.isFailure()) {
      return failure(chainProfileDetailsResult.failure);
    }

    const details = chainProfileDetailsResult.successResult;

    if (details.sigNonce !== typedData.value.nonce) {
      this.log('nonce mismatch', { expected: details.sigNonce, actual: typedData.value.nonce });
      return failure(MomokaValidatorError.PUBLICATION_NONCE_INVALID);
    }

    if (details.dispatcherAddress !== whoSigned && details.ownerOfAddress !== whoSigned) {
      return failure(MomokaValidatorError.PUBLICATION_SIGNER_NOT_ALLOWED);
    }

    return success({
      currentPublicationId: details.currentPublicationId,
      ownerOfAddress: details.ownerOfAddress,
    });
  }
}
