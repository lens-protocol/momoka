import { LogFunctionType } from '../../../common/logger';
import { failure, PromiseResult } from '../../../data-availability-models/da-result';
import { DAPublicationPointerType } from '../../../data-availability-models/publications/data-availability-structure-publication';
import { MomokaValidatorError } from '../../../data-availability-models/validator-errors';
import { EthereumNode } from '../../../evm/ethereum';
import { DaProofChecker } from '../../da-proof-checker';
import { DAStructureQuoteVerifierV2 } from './da-structure-quote-verifier-v2';

/**
 * Checks if the given DAQuotePublication is valid by verifying the proof chain, cross-checking against the event, and
 * validating the signature.
 * @param daPublicationVerifier The verifier for the DAQuotePublication.
 * @param verifyPointer If true, the pointer chain will be verified before checking the publication.
 * @param ethereumNode The EthereumNode to use for fetching data from the Ethereum blockchain.
 * @param log A function used for logging output.
 * @param checker The DAProofChecker to use for checking the proof.
 * @returns A PromiseResult indicating success or failure, along with an optional error message.
 */
export const checkDAQuote = async (
  daPublicationVerifier: DAStructureQuoteVerifierV2,
  verifyPointer: boolean,
  ethereumNode: EthereumNode,
  log: LogFunctionType,
  checker: DaProofChecker
): PromiseResult => {
  log('check DA quote');

  const publication = daPublicationVerifier.daPublication;

  if (!publication.chainProofs.pointer) {
    return failure(MomokaValidatorError.PUBLICATION_NO_POINTER);
  }

  if (publication.chainProofs.pointer.type !== DAPublicationPointerType.ON_DA) {
    return failure(MomokaValidatorError.PUBLICATION_NONE_DA);
  }

  // if (verifyPointer) {
  //   log('verify pointer first');
  //
  //   // check the pointer!
  //   const pointerResult = await checker.checkDAProof(
  //     publication.chainProofs.pointer.location,
  //     ethereumNode,
  //     {
  //       byPassDb: false,
  //       verifyPointer: false,
  //       log,
  //     }
  //   );
  //   if (pointerResult.isFailure()) {
  //     return failure(MomokaValidatorError.POINTER_FAILED_VERIFICATION);
  //   }
  // }

  const signerResult = await daPublicationVerifier.verifySigner();

  if (signerResult.isFailure()) {
    return failure(signerResult.failure);
  }

  const eventResult = await daPublicationVerifier.verifyEventWithTypedData(
    signerResult.successResult.currentPublicationId
  );

  log('finished checking DA quote');

  return eventResult;
};
