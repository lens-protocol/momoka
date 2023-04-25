import { existsSync, mkdirSync } from 'fs';
import { Level } from 'level';
import { DATimestampProofsResponse } from '../data-availability-models/data-availability-timestamp-proofs';
import {
  DAEventType,
  DAStructurePublication,
  PublicationTypedData,
} from '../data-availability-models/publications/data-availability-structure-publication';
import { BlockInfo } from '../evm/ethereum';
import { invariant } from '../utils/invariant';
import { failedProofsPath, lensDAPath, pathResolver } from './paths';
import { TxValidatedResult } from './tx-validated-results';

let db: Level | undefined;

export enum DbReference {
  block = 'block',
  tx = 'tx',
  tx_da_metadata = 'tx_da_metadata',
  tx_timestamp_proof_metadata = 'tx_timestamp_proof_metadata',
  cursor = 'cursor',
}

/**
 * Starts the LevelDB database.
 */
export const startDb = async (): Promise<void> => {
  invariant(!db, 'Database already started');

  const path = await pathResolver();
  const lens__da = await lensDAPath();
  if (!existsSync(lens__da)) {
    mkdirSync(lens__da);
  }

  const failedProofs = await failedProofsPath();
  if (!existsSync(failedProofs)) {
    mkdirSync(failedProofs);
  }

  const dbPath = path.join(lens__da, 'database');
  if (!existsSync(dbPath)) {
    mkdirSync(dbPath);
  }

  db = new Level(dbPath);
};

/**
 * Deletes an item from the database.
 * @param key - The key of the item to be deleted.
 */
export const deleteDb = (key: string): Promise<void> => {
  if (!db) {
    return Promise.resolve();
  }

  return db.del(key);
};

/**
 * Gets a transaction from the database.
 * @param txId - The ID of the transaction to get.
 * @returns The transaction if it exists, null otherwise.
 */
export const getTxDb = async (txId: string): Promise<TxValidatedResult | null> => {
  if (!db) {
    return null;
  }

  try {
    const result = await db.get(`${DbReference.tx}:${txId}`);
    return JSON.parse(result) as TxValidatedResult;
  } catch (e) {
    return null;
  }
};

/**
 * Saves a transaction to the database.
 *
 * @param txId - The ID of the transaction to save.
 * @param result - The result of the transaction.
 */
export const saveTxDb = async (txId: string, result: TxValidatedResult): Promise<void> => {
  if (!db) {
    return;
  }

  try {
    await db.put(`${DbReference.tx}:${txId}`, JSON.stringify(result));
  } catch (error) {
    throw new Error('`saveTxDb`- Could not write to into the db - critical error!');
  }
};

/**
 * Gets a block from the database.
 *
 * @param blockNumber - The number of the block to get.
 * @returns The block if it exists, null otherwise.
 */
export const getBlockDb = async (blockNumber: number): Promise<BlockInfo | null> => {
  if (!db) {
    return null;
  }

  try {
    const result = await db.get(`${DbReference.block}:${blockNumber}`);
    return JSON.parse(result) as BlockInfo;
  } catch (e) {
    return null;
  }
};

/**
 * Saves a block to the database.
 *
 * @param block - The block to save.
 */
export const saveBlockDb = async (block: BlockInfo): Promise<void> => {
  if (!db) {
    return;
  }

  try {
    await db.put(`${DbReference.block}:${block.number}`, JSON.stringify(block));
  } catch (error) {
    throw new Error('`saveBlockDb` - Could not write to into the db - critical error!');
  }
};

/**
 * Gets the last end cursor from the database.
 * Returns null if the database is not available or there is no cursor.
 * @returns The last end cursor.
 */
export const getLastEndCursorDb = async (): Promise<string | null> => {
  invariant(db, 'Database not started');

  try {
    return await db.get(DbReference.cursor);
  } catch (e) {
    return null;
  }
};

/**
 * Saves the end cursor to the database.
 * @param cursor - The end cursor to save.
 * @throws Throws an error if the database is not available.
 */
export const saveEndCursorDb = async (cursor: string): Promise<void> => {
  invariant(db, 'Database not started');

  try {
    await db.put(DbReference.cursor, cursor);
  } catch (error) {
    throw new Error('Could not write to into the db - critical error!');
  }
};

/**
 *  Gets the total checked count from the database.
 */
export const getTotalCheckedCountDb = async (): Promise<number> => {
  invariant(db, 'Database not started');

  try {
    const result = await db.get(`${DbReference.tx}:totalCheckedCount`);
    if (result) {
      return Number(result);
    }

    return 0;
  } catch (e) {
    return 0;
  }
};

/**
 *  Saves the total checked count to the database.
 * @param checked The checked count to add to current total
 */
export const saveTotalCheckedCountDb = async (checked: number): Promise<void> => {
  invariant(db, 'Database not started');

  try {
    const currentCount = (await getTotalCheckedCountDb()) || 0;
    await db.put(`${DbReference.tx}:totalCheckedCount`, (currentCount + checked).toString());
  } catch (error) {
    throw new Error('Could not write to into the db - critical error!');
  }
};

/**
 * Saves the given publication metadata to the database under the given transaction ID
 * @param txId The transaction ID to use as the key in the database
 * @param publication The publication metadata to save
 * @throws An error if the database is not available or if the write operation fails
 */
export const saveTxDAMetadataDb = async (
  txId: string,
  publication: DAStructurePublication<DAEventType, PublicationTypedData>
): Promise<void> => {
  if (!db) {
    return;
  }

  try {
    await db.put(`${DbReference.tx_da_metadata}:${txId}`, JSON.stringify(publication));
  } catch (error) {
    throw new Error('Could not write to the db - critical error!');
  }
};

/**
 * Retrieves the publication metadata associated with the given transaction ID from the database
 * @param txId The transaction ID to use as the key in the database
 * @returns The publication metadata if it is found, or null if it is not found or if the database is not available
 */
export const getTxDAMetadataDb = async (
  txId: string
): Promise<DAStructurePublication<DAEventType, PublicationTypedData> | null> => {
  if (!db) {
    return null;
  }

  try {
    const result = await db.get(`${DbReference.tx_da_metadata}:${txId}`);
    return JSON.parse(result) as DAStructurePublication<DAEventType, PublicationTypedData>;
  } catch (e) {
    return null;
  }
};

/**
 * Saves the given timestamp proofs metadata to the database under the given transaction ID
 * @param txId The transaction ID to use as the key in the database
 * @param proofs The timestamp proofs metadata to save
 * @throws An error if the database is not available or if the write operation fails
 */
export const saveTxTimestampProofsMetadataDb = async (
  txId: string,
  proofs: DATimestampProofsResponse
): Promise<void> => {
  if (!db) {
    return;
  }

  try {
    await db.put(`${DbReference.tx_timestamp_proof_metadata}:${txId}`, JSON.stringify(proofs));
  } catch (error) {
    throw new Error('Could not write to the db - critical error!');
  }
};

/**
 * Retrieves the timestamp proofs metadata associated with the given transaction ID from the database
 * @param txId The transaction ID to use as the key in the database
 * @returns The timestamp proofs metadata if it is found, or null if it is not found or if the database is not available
 */
export const getTxTimestampProofsMetadataDb = async (
  txId: string
): Promise<DATimestampProofsResponse | null> => {
  if (!db) {
    return null;
  }

  try {
    const result = await db.get(`${DbReference.tx_timestamp_proof_metadata}:${txId}`);
    return JSON.parse(result) as DATimestampProofsResponse;
  } catch (e) {
    return null;
  }
};
