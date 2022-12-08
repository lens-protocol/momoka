import { DAStructureBase } from '../data-availability-structure-base';
import {
  CreateCommentEIP712TypedData,
  CreateMirrorEIP712TypedData,
  CreatePostEIP712TypedData,
} from './data-availability-publication-typed-data';
import {
  DACommentCreatedEventEmittedResponse,
  DAMirrorCreatedEventEmittedResponse,
  DAPostCreatedEventEmittedResponse,
} from './data-availability-structure-publications-events';

export type PublicationTypedData =
  | CreatePostEIP712TypedData
  | CreateCommentEIP712TypedData
  | CreateMirrorEIP712TypedData;

interface DAStructurePublicationProofs<TTypedData extends PublicationTypedData> {
  thisPublication: {
    /**
     * The signature which can be submitted on that block to prove the publication would of passed
     */
    signature: string;

    /**
     * The signature deadline unix timestamp
     */
    signatureDeadline: number;

    /**
     * The typed data that was signed
     */
    typedData: TTypedData;

    /**
     * The block hash of the block that contains the proof and should be ran on
     */
    blockHash: string;

    /**
     * The block timestamp the proof ran on
     */
    blockTimestamp: number;

    /**
     * The block number at this point make sure hash matches (you fork on block number not on block hash)
     */
    blockNumber: number;
  };

  /**
   * This is the pointers proofs, if the publication is another DA publication then this will be the proofs of that publication
   */
  pointer: string | null;
}

export type DAEventType =
  | DAPostCreatedEventEmittedResponse
  | DACommentCreatedEventEmittedResponse
  | DAMirrorCreatedEventEmittedResponse;

export interface DAStructurePublication<
  TEvent extends DAEventType,
  TTypedData extends PublicationTypedData
> extends DAStructureBase {
  /**
   * As close if not exactly the same as how the blockchain event was emitted.
   */
  event: TEvent;

  /**
   * The proofs that can be verified on the blockchain.
   */
  chainProofs: DAStructurePublicationProofs<TTypedData>;
}
