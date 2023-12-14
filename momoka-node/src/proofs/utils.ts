import type CryptoInterface from 'arweave/node/lib/crypto/crypto-interface';
import { BlockInfo } from '../evm/ethereum';
import { unixTimestampToMilliseconds } from '../common/helpers';
import { DAStructurePublication } from '../data-availability-models/publications/data-availability-structure-publication';
import { BundlrUploadResponse } from '../data-availability-models/data-availability-timestamp-proofs';
import { BigNumberish } from 'ethers';

/**
 * Finds the closest block based on timestamp in milliseconds.
 * @param blocks List of blocks to search through
 * @param targetTimestamp Timestamp in milliseconds to match against block timestamp
 * @returns The block with the closest matching timestamp
 */
export const getClosestBlock = (blocks: BlockInfo[], targetTimestamp: number): BlockInfo => {
  const targetTimestampMs = unixTimestampToMilliseconds(targetTimestamp);

  return blocks.reduce((prev, curr) => {
    const prevTimestamp = unixTimestampToMilliseconds(prev.timestamp);
    const currTimestamp = unixTimestampToMilliseconds(curr.timestamp);

    if (currTimestamp > targetTimestampMs) {
      return prev;
    }

    const prevDifference = Math.abs(prevTimestamp - targetTimestampMs);
    const currDifference = Math.abs(currTimestamp - targetTimestampMs);

    return currDifference < prevDifference ? curr : prev;
  });
};

/**
 * Generates the unique ID for a DAStructurePublication.
 * @param profileId The profile ID of the publication.
 * @param publicationId The publication ID of the publication.
 * @param dataAvailabilityId The data availability ID of the publication.
 */
export const generatePublicationId = (
  profileId: BigNumberish,
  publicationId: BigNumberish,
  dataAvailabilityId: string
): string => {
  return `${profileId}-${publicationId}-DA-${dataAvailabilityId.split('-')[0]}`;
};

/**
 * Checks if the typed data deadline timestamp in the given DAStructurePublication matches
 * the block timestamp of the containing block.
 * @param daPublication The DAStructurePublication to check.
 * @returns True if the typed data deadline timestamp matches the block timestamp, false otherwise.
 */
export const isValidTypedDataDeadlineTimestamp = (
  daPublication: DAStructurePublication
): boolean => {
  return (
    daPublication.chainProofs.thisPublication.typedData.value.deadline ===
    daPublication.chainProofs.thisPublication.blockTimestamp
  );
};

/**
 * Checks if the event timestamp in the given DA publication matches the publication timestamp of the block it was included in.
 * @param daPublication The DA publication to check.
 * @returns A boolean indicating whether or not the event timestamp matches the publication timestamp.
 */
export const isValidEventTimestamp = (daPublication: DAStructurePublication): boolean => {
  return daPublication.event.timestamp === daPublication.chainProofs.thisPublication.blockTimestamp;
};

type Providers = {
  stringToBuffer: (str: string) => Uint8Array;
  b64UrlToBuffer: (str: string) => Uint8Array;
  deepHash: (str: Uint8Array[]) => Promise<Uint8Array>;
  crypto: CryptoInterface;
};

/**
 * Verifies the signature of a Bundlr upload response.
 * Copied from https://github.com/Bundlr-Network/js-sdk/blob/main/src/common/utils.ts to make the code isomorphic
 * and avoid bringing node native modules to client code.
 * @param response The Bundlr upload response to verify.
 * @param providers The providers to use for the verification (should be either the one for node or client).
 */
export const verifyReceipt = async (
  { deadlineHeight, id, public: pubKey, signature, timestamp, version }: BundlrUploadResponse,
  { crypto, b64UrlToBuffer, stringToBuffer, deepHash }: Providers
): Promise<boolean> => {
  const dh = await deepHash([
    stringToBuffer('Bundlr'),
    stringToBuffer(version),
    stringToBuffer(id),
    stringToBuffer(deadlineHeight.toString()),
    stringToBuffer(timestamp.toString()),
  ]);

  return await crypto.verify(pubKey, dh, b64UrlToBuffer(signature));
};
