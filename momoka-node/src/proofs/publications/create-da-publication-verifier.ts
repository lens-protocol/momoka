import { DAStructurePublication } from '../../data-availability-models/publications/data-availability-structure-publication';
import { DAActionTypes } from '../../data-availability-models/data-availability-action-types';
import { DACommentVerifierV1, isDACommentPublicationV1 } from './comment/da-comment-verifier-v1';
import { DACommentVerifierV2, isDACommentPublicationV2 } from './comment/da-comment-verifier-v2';
import { LogFunctionType } from '../../common/logger';
import { DAMirrorVerifierV1, isDAMirrorPublicationV1 } from './mirror/da-mirror-verifier-v1';
import { DAMirrorVerifierV2, isDAMirrorPublicationV2 } from './mirror/da-mirror-verifier-v2';
import { EthereumNode } from '../../evm/ethereum';
import { DAPostVerifierV1, isDAPostPublicationV1 } from './post/da-post-verifier-v1';
import { DAPostVerifierV2, isDAPostPublicationV2 } from './post/da-post-verifier-v2';
import { DAQuoteVerifierV2, isDAQuotePublicationV2 } from './quote/da-quote-verifier-v2';
import { failure, PromiseResult, success } from '../../data-availability-models/da-result';
import { MomokaValidatorError } from '../../data-availability-models/validator-errors';

export type DAPublicationVerifier =
  | DAPostVerifierV1
  | DAPostVerifierV2
  | DACommentVerifierV1
  | DACommentVerifierV2
  | DAMirrorVerifierV1
  | DAMirrorVerifierV2
  | DAQuoteVerifierV2;

export const createDAPublicationVerifier = (
  daPublication: DAStructurePublication,
  ethereumNode: EthereumNode,
  log: LogFunctionType
): PromiseResult<DAPublicationVerifier> => {
  switch (daPublication.type) {
    case DAActionTypes.POST_CREATED:
      if (isDAPostPublicationV1(daPublication)) {
        log('verifying post v1');
        return Promise.resolve(success(new DAPostVerifierV1(daPublication, ethereumNode, log)));
      }

      if (isDAPostPublicationV2(daPublication)) {
        log('verifying post v2');

        return Promise.resolve(success(new DAPostVerifierV2(daPublication, ethereumNode, log)));
      }

      log('post was not recognized as v1 or v2');

      return Promise.resolve(failure(MomokaValidatorError.PUBLICATION_NOT_RECOGNIZED));
    case DAActionTypes.COMMENT_CREATED:
      if (isDACommentPublicationV1(daPublication)) {
        log('verifying comment v1');

        return Promise.resolve(success(new DACommentVerifierV1(daPublication, ethereumNode, log)));
      }

      if (isDACommentPublicationV2(daPublication)) {
        log('verifying comment v2');

        return Promise.resolve(success(new DACommentVerifierV2(daPublication, ethereumNode, log)));
      }

      log('comment was not recognized as v1 or v2');

      return Promise.resolve(failure(MomokaValidatorError.PUBLICATION_NOT_RECOGNIZED));
    case DAActionTypes.MIRROR_CREATED:
      if (isDAMirrorPublicationV1(daPublication)) {
        log('verifying mirror v1');

        return Promise.resolve(success(new DAMirrorVerifierV1(daPublication, ethereumNode, log)));
      }
      if (isDAMirrorPublicationV2(daPublication)) {
        log('verifying mirror v2');

        return Promise.resolve(success(new DAMirrorVerifierV2(daPublication, ethereumNode, log)));
      }

      log('mirror was not recognized as v1 or v2');

      return Promise.resolve(failure(MomokaValidatorError.PUBLICATION_NOT_RECOGNIZED));
    case DAActionTypes.QUOTE_CREATED:
      if (isDAQuotePublicationV2(daPublication)) {
        log('verifying quote v2');

        return Promise.resolve(success(new DAQuoteVerifierV2(daPublication, ethereumNode, log)));
      }
      log('quote was not recognized as v2');

      return Promise.resolve(failure(MomokaValidatorError.PUBLICATION_NOT_RECOGNIZED));
    default:
      return Promise.resolve(failure(MomokaValidatorError.PUBLICATION_NOT_RECOGNIZED));
  }
};
