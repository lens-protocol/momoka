import { LogFunctionType } from '../../../common/logger';
import { failure, PromiseResult } from '../../../data-availability-models/da-result';
import { MomokaValidatorError } from '../../../data-availability-models/validator-errors';
import { DAPostVerifierV1 } from './da-post-verifier-v1';
import { DAPostVerifierV2 } from './da-post-verifier-v2';

/**
 * Checks if the given DAPostPublication is valid by verifying the proof chain, cross-checking against the event, and
 * validating the signature.
 * @param daPublicationVerifier The verifier for the DACommentPublication.
 * @param log A function used for logging output.
 * @returns A PromiseResult indicating success or failure, along with an optional error message.
 */
export const checkDAPost = async (
  daPublicationVerifier: DAPostVerifierV1 | DAPostVerifierV2,
  log: LogFunctionType
): PromiseResult => {
  log('check DA post');

  const publication = daPublicationVerifier.daPublication;

  if (publication.chainProofs.pointer) {
    return failure(MomokaValidatorError.INVALID_POINTER_SET_NOT_NEEDED);
  }

  const simulatedResult = await daPublicationVerifier.verifySimulation();

  if (simulatedResult.isFailure()) {
    return failure(simulatedResult.failure);
  }

  // cross-check event and typed data values
  const eventResult = daPublicationVerifier.verifyEventWithTypedData(simulatedResult.successResult);

  log('finished checking DA post');

  return eventResult;
};
