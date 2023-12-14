import { DAStructurePublication } from '../../data-availability-models/publications/data-availability-structure-publication';
import { DaPublicationVerifierBase } from './da-publication-verifier-base';
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

export const createDAPublicationVerifier = (
  daPublication: DAStructurePublication,
  ethereumNode: EthereumNode,
  log: LogFunctionType
): DaPublicationVerifierBase | DAStructurePostVerifierV2 => {
  switch (daPublication.type) {
    case DAActionTypes.POST_CREATED:
      if (isDAPostPublicationV1(daPublication)) {
        return new DAStructurePostVerifierV1(daPublication, ethereumNode, log);
      }

      if (isDAPostPublicationV2(daPublication)) {
        return new DAStructurePostVerifierV2(daPublication, ethereumNode, log);
      }

      throw new Error('Unknown post publication type');
    case DAActionTypes.COMMENT_CREATED:
      if (isDACommentPublicationV1(daPublication)) {
        return new DAStructureCommentVerifierV1(daPublication, ethereumNode, log);
      }

      if (isDACommentPublicationV2(daPublication)) {
        return new DAStructureCommentVerifierV2(daPublication, ethereumNode, log);
      }

      throw new Error('Unknown comment publication type');
    case DAActionTypes.MIRROR_CREATED:
      if (isDAMirrorPublicationV1(daPublication)) {
        return new DAStructureMirrorVerifierV1(daPublication, ethereumNode, log);
      }
      if (isDAMirrorPublicationV2(daPublication)) {
        return new DAStructureMirrorVerifierV2(daPublication, ethereumNode, log);
      }

      throw new Error('Unknown mirror publication type');

    case DAActionTypes.QUOTE_CREATED:
      if (isDAQuotePublicationV2(daPublication)) {
        return new DAStructureQuoteVerifierV2(daPublication, ethereumNode, log);
      }

      throw new Error('Unknown mirror publication type');
    default:
      throw new Error('Unknown publication type');
  }
};
