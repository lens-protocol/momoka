import { DAStructurePublication } from '../../../data-availability-models/publications/data-availability-structure-publication';
import { DAMirrorCreatedEventEmittedResponseV1 } from '../../../data-availability-models/publications/data-availability-structure-publications-events';
import { DAPublicationVerifierV1 } from '../da-publication-verifier-v1';
import { LogFunctionType } from '../../../common/logger';
import { failure, PromiseResult, success } from '../../../data-availability-models/da-result';
import { BigNumber } from 'ethers';
import { MomokaValidatorError } from '../../../data-availability-models/validator-errors';
import { EMPTY_BYTE, EthereumNode } from '../../../evm/ethereum';
import { CreateMirrorV1EIP712TypedData } from '../../../data-availability-models/publications/data-availability-publication-typed-data';
import { DAActionTypes } from '../../../data-availability-models/data-availability-action-types';
import { whoSignedTypedData } from '../publication.base';
import { LensHubV1Gateway } from '../../../evm/gateway/LensHubV1Gateway';

export type DAMirrorPublicationV1 = DAStructurePublication<
  DAMirrorCreatedEventEmittedResponseV1,
  CreateMirrorV1EIP712TypedData
>;

export const isDAMirrorPublicationV1 = (
  daPublication: DAStructurePublication
): daPublication is DAMirrorPublicationV1 => {
  return (
    daPublication.type === DAActionTypes.MIRROR_CREATED && !('mirrorParams' in daPublication.event)
  );
};

export class DAStructureMirrorVerifierV1 extends DAPublicationVerifierV1 {
  private readonly lensHubGateway: LensHubV1Gateway;

  constructor(
    public readonly daPublication: DAMirrorPublicationV1,
    readonly ethereumNode: EthereumNode,
    private readonly log: LogFunctionType
  ) {
    super(daPublication);

    this.lensHubGateway = new LensHubV1Gateway(ethereumNode);
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

  verifyEventWithTypedData(pubCountAtBlock: string): PromiseResult {
    const event = this.daPublication.event;
    const typedData = this.daPublication.chainProofs.thisPublication.typedData;

    // compare all event emitted to typed data value
    this.log('cross check event with typed data value');

    // check the pub count makes sense from the block!
    if (BigNumber.from(pubCountAtBlock).add(1).toHexString() !== event.pubId) {
      return Promise.resolve(failure(MomokaValidatorError.EVENT_MISMATCH));
    }

    this.log('pub count at block is correct');

    // compare all others!
    if (
      typedData.value.profileId !== event.profileId ||
      typedData.value.profileIdPointed !== event.profileIdPointed ||
      typedData.value.pubIdPointed !== event.pubIdPointed ||
      typedData.value.referenceModule !== event.referenceModule ||
      event.referenceModuleReturnData !== EMPTY_BYTE ||
      typedData.value.referenceModuleInitData !== EMPTY_BYTE
    ) {
      return Promise.resolve(failure(MomokaValidatorError.EVENT_MISMATCH));
    }

    this.log('cross check event is complete');

    return Promise.resolve(success());
  }
}
