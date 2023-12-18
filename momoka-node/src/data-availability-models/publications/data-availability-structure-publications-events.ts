import {
  PostCreatedEventEmittedResponse as PostCreatedEventEmittedResponseV1,
  MirrorCreatedEventEmittedResponse as MirrorCreatedEventEmittedResponseV1,
  CommentCreatedEventEmittedResponse as CommentCreatedEventEmittedResponseV1,
} from '../../evm/abi-types/LensHubV1Events';

import {
  PostCreatedEventEmittedResponse as PostCreatedEventEmittedResponseV2,
  CommentCreatedEventEmittedResponse as CommentCreatedEventEmittedResponseV2,
  MirrorCreatedEventEmittedResponse as MirrorCreatedEventEmittedResponseV2,
  QuoteCreatedEventEmittedResponse as QuoteCreatedEventEmittedResponseV2,
} from '../../evm/abi-types/LensHubV2Events';

export type DAPostCreatedEventEmittedResponseV1 = PostCreatedEventEmittedResponseV1;
export type DAPostCreatedEventEmittedResponseV2 = PostCreatedEventEmittedResponseV2;
export type DAPostCreatedEventEmittedResponse =
  | DAPostCreatedEventEmittedResponseV1
  | DAPostCreatedEventEmittedResponseV2;

export type DACommentCreatedEventEmittedResponseV1 = CommentCreatedEventEmittedResponseV1;
export type DACommentCreatedEventEmittedResponseV2 = CommentCreatedEventEmittedResponseV2;
export type DACommentCreatedEventEmittedResponse =
  | DACommentCreatedEventEmittedResponseV1
  | DACommentCreatedEventEmittedResponseV2;

export type DAMirrorCreatedEventEmittedResponseV1 = MirrorCreatedEventEmittedResponseV1;
export type DAMirrorCreatedEventEmittedResponseV2 = MirrorCreatedEventEmittedResponseV2;
export type DAMirrorCreatedEventEmittedResponse =
  | DAMirrorCreatedEventEmittedResponseV1
  | DAMirrorCreatedEventEmittedResponseV2;

export type DAQuoteCreatedEventEmittedResponseV2 = QuoteCreatedEventEmittedResponseV2;
export type DAQuoteCreatedEventEmittedResponse = DAQuoteCreatedEventEmittedResponseV2;

export type DAEventTypeV1 =
  | DAPostCreatedEventEmittedResponseV1
  | DACommentCreatedEventEmittedResponseV1
  | DAMirrorCreatedEventEmittedResponseV1;

export type DAEventTypeV2 =
  | DAPostCreatedEventEmittedResponseV2
  | DACommentCreatedEventEmittedResponseV2
  | DAMirrorCreatedEventEmittedResponseV2
  | DAQuoteCreatedEventEmittedResponseV2;

export type DAEventType = DAEventTypeV1 | DAEventTypeV2;
