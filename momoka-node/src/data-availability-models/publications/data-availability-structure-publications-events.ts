import {
  CommentCreatedEventEmittedResponse,
  MirrorCreatedEventEmittedResponse,
  PostCreatedEventEmittedResponse,
} from '../../evm/abi-types/LensHubEvents';

export interface DAPostCreatedEventEmittedResponse extends PostCreatedEventEmittedResponse {}
export interface DACommentCreatedEventEmittedResponse extends CommentCreatedEventEmittedResponse {}
export interface DAMirrorCreatedEventEmittedResponse extends MirrorCreatedEventEmittedResponse {}
