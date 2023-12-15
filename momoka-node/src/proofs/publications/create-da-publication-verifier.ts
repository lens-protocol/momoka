import { DAStructurePublication } from '../../data-availability-models/publications/data-availability-structure-publication';
import { DAActionTypes } from '../../data-availability-models/data-availability-action-types';
import {
  DAStructureCommentVerifierV1,
  isDACommentPublicationV1,
} from './comment/da-structure-comment-verifier-v1';
import {
  DAStructureCommentVerifierV2,
  isDACommentPublicationV2,
} from './comment/da-structure-comment-verifier-v2';
import { LogFunctionType } from '../../common/logger';
import {
  DAStructureMirrorVerifierV1,
  isDAMirrorPublicationV1,
} from './mirror/da-structure-mirror-verifier-v1';
import {
  DAStructureMirrorVerifierV2,
  isDAMirrorPublicationV2,
} from './mirror/da-structure-mirror-verifier-v2';
import { EthereumNode } from '../../evm/ethereum';
import {
  DAStructurePostVerifierV1,
  isDAPostPublicationV1,
} from './post/da-structure-post-verifier-v1';
import {
  DAStructurePostVerifierV2,
  isDAPostPublicationV2,
} from './post/da-structure-post-verifier-v2';
import {
  DAStructureQuoteVerifierV2,
  isDAQuotePublicationV2,
} from './quote/da-structure-quote-verifier-v2';
import { failure, PromiseResult, success } from '../../data-availability-models/da-result';
import { MomokaValidatorError } from '../../data-availability-models/validator-errors';

export type DAPublicationVerifier =
  | DAStructurePostVerifierV1
  | DAStructurePostVerifierV2
  | DAStructureCommentVerifierV1
  | DAStructureCommentVerifierV2
  | DAStructureMirrorVerifierV1
  | DAStructureMirrorVerifierV2
  | DAStructureQuoteVerifierV2;

export const createDAPublicationVerifier = (
  daPublication: DAStructurePublication,
  ethereumNode: EthereumNode,
  log: LogFunctionType
): PromiseResult<DAPublicationVerifier> => {
  switch (daPublication.type) {
    case DAActionTypes.POST_CREATED:
      if (isDAPostPublicationV1(daPublication)) {
        log('verifying post v1');
        return Promise.resolve(
          success(new DAStructurePostVerifierV1(daPublication, ethereumNode, log))
        );
      }

      if (isDAPostPublicationV2(daPublication)) {
        log('verifying post v2');

        return Promise.resolve(
          success(new DAStructurePostVerifierV2(daPublication, ethereumNode, log))
        );
      }

      log('post was not recognized as v1 or v2');

      return Promise.resolve(failure(MomokaValidatorError.PUBLICATION_NOT_RECOGNIZED));
    case DAActionTypes.COMMENT_CREATED:
      if (isDACommentPublicationV1(daPublication)) {
        log('verifying comment v1');

        return Promise.resolve(
          success(new DAStructureCommentVerifierV1(daPublication, ethereumNode, log))
        );
      }

      if (isDACommentPublicationV2(daPublication)) {
        log('verifying comment v2');

        return Promise.resolve(
          success(new DAStructureCommentVerifierV2(daPublication, ethereumNode, log))
        );
      }

      log('comment was not recognized as v1 or v2');

      return Promise.resolve(failure(MomokaValidatorError.PUBLICATION_NOT_RECOGNIZED));
    case DAActionTypes.MIRROR_CREATED:
      if (isDAMirrorPublicationV1(daPublication)) {
        log('verifying mirror v1');

        return Promise.resolve(
          success(new DAStructureMirrorVerifierV1(daPublication, ethereumNode, log))
        );
      }
      if (isDAMirrorPublicationV2(daPublication)) {
        log('verifying mirror v2');

        return Promise.resolve(
          success(new DAStructureMirrorVerifierV2(daPublication, ethereumNode, log))
        );
      }

      log('mirror was not recognized as v1 or v2');

      return Promise.resolve(failure(MomokaValidatorError.PUBLICATION_NOT_RECOGNIZED));
    case DAActionTypes.QUOTE_CREATED:
      if (isDAQuotePublicationV2(daPublication)) {
        log('verifying quote v2');

        return Promise.resolve(
          success(new DAStructureQuoteVerifierV2(daPublication, ethereumNode, log))
        );
      }
      log('quote was not recognized as v2');

      return Promise.resolve(failure(MomokaValidatorError.PUBLICATION_NOT_RECOGNIZED));
    default:
      return Promise.resolve(failure(MomokaValidatorError.PUBLICATION_NOT_RECOGNIZED));
  }
};
