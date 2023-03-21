import { BlockInfo } from '../evm/ethereum';
import { unixTimestampToMilliseconds } from '../common/helpers';
import {
  DAEventType,
  DAStructurePublication,
  PublicationTypedData,
} from '../data-availability-models/publications/data-availability-structure-publication';

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
 * Checks if the publication id generated from the given DAStructurePublication matches the publication id of the same
 * DAStructurePublication.
 * @param daPublication The DAStructurePublication to validate.
 * @returns true if the generated publication id matches the publication id of the given DAStructurePublication.
 */
export const isValidPublicationId = (
  daPublication: DAStructurePublication<DAEventType, PublicationTypedData>
): boolean => {
  const generatedPublicationId = generatePublicationId(daPublication);

  return generatedPublicationId === daPublication.publicationId;
};

/**
 * Generates the unique ID for a DAStructurePublication.
 * @param daPublication The DAStructurePublication to generate an ID for
 */
const generatePublicationId = (
  daPublication: DAStructurePublication<DAEventType, PublicationTypedData>
): string => {
  return `${daPublication.event.profileId}-${daPublication.event.pubId}-DA-${
    daPublication.dataAvailabilityId.split('-')[0]
  }`;
};

/**
 * Checks if the typed data deadline timestamp in the given DAStructurePublication matches
 * the block timestamp of the containing block.
 * @param daPublication The DAStructurePublication to check.
 * @returns True if the typed data deadline timestamp matches the block timestamp, false otherwise.
 */
export const isValidTypedDataDeadlineTimestamp = (
  daPublication: DAStructurePublication<DAEventType, PublicationTypedData>
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
export const isValidEventTimestamp = (
  daPublication: DAStructurePublication<DAEventType, PublicationTypedData>
): boolean => {
  return daPublication.event.timestamp === daPublication.chainProofs.thisPublication.blockTimestamp;
};
