import { failure, PromiseResult, success } from '../../data-availability-models/da-result';
import { DAEventTypeV2 } from '../../data-availability-models/publications/data-availability-structure-publications-events';
import { PublicationV2TypedData } from '../../data-availability-models/publications/data-availability-publication-typed-data';
import { DAStructurePublication } from '../../data-availability-models/publications/data-availability-structure-publication';
import { whoSignedTypedData } from './publication.base';
import { MomokaValidatorError } from '../../data-availability-models/validator-errors';
import { EthereumNode } from '../../evm/ethereum';
import { LogFunctionType } from '../../common/logger';
import { LensHubV2Gateway } from '../../evm/gateway/LensHubV2Gateway';

export abstract class DAPublicationVerifierV2 {
  protected readonly lensHubGateway: LensHubV2Gateway;

  constructor(
    public readonly daPublication: DAStructurePublication<DAEventTypeV2, PublicationV2TypedData>,
    protected readonly ethereumNode: EthereumNode,
    protected readonly log: LogFunctionType
  ) {
    this.lensHubGateway = new LensHubV2Gateway(ethereumNode);
  }

  abstract verifyPublicationIdMatches(): boolean;

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

    if (details.nonces !== typedData.value.nonce) {
      this.log('nonce mismatch', { expected: details.nonces, actual: typedData.value.nonce });
      return failure(MomokaValidatorError.PUBLICATION_NONCE_INVALID);
    }

    if (details.ownerOfAddress !== whoSigned && !details.isSignerApprovedExecutor) {
      return failure(MomokaValidatorError.PUBLICATION_SIGNER_NOT_ALLOWED);
    }

    return success({
      currentPublicationId: details.currentPublicationId,
      ownerOfAddress: details.ownerOfAddress,
    });
  }
}
