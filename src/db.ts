import { Block } from '@ethersproject/abstract-provider';
import { Level } from 'level';
import { ClaimableValidatorError } from './claimable-validator-errors';
import { DATimestampProofsResponse } from './data-availability-models/data-availability-timestamp-proofs';
import {
  DAEventType,
  DAStructurePublication,
  PublicationTypedData,
} from './data-availability-models/publications/data-availability-structure-publication';
import { BlockInfo } from './ethereum';

let db: Level | undefined;

export enum DbReference {
  block = 'block',
  tx = 'tx',
  tx_da_metadata = 'tx_da_metadata',
  tx_timestamp_proof_metadata = 'tx_timestamp_proof_metadata',
  cursor = 'cursor',
}

export type TxValidatedResult = TxValidatedFailureResult | TxValidatedSuccessResult;

interface TxValidatedResultBase<TSuccess extends boolean, TDAStructurePublication> {
  proofTxId: string;
  success: TSuccess;
  dataAvailabilityResult: TDAStructurePublication;
}

export interface TxValidatedFailureResult
  extends TxValidatedResultBase<
    false,
    DAStructurePublication<DAEventType, PublicationTypedData> | undefined
  > {
  failureReason: ClaimableValidatorError;
  extraErrorInfo?: string;
}

export interface TxValidatedSuccessResult
  extends TxValidatedResultBase<true, DAStructurePublication<DAEventType, PublicationTypedData>> {}

export const startDb = (dbLocationFolderPath: string) => {
  if (db) return;

  const path = require('path');
  const dbPath = path.join(process.cwd(), dbLocationFolderPath);

  const fs = require('fs');
  if (!fs.existsSync(dbPath)) {
    fs.mkdirSync(dbPath);
  }

  db = new Level(dbPath);
};

export const deleteDb = (key: string) => {
  if (!db) return;
  return db.del(key);
};

export const getTxDb = async (txId: string): Promise<TxValidatedResult | null> => {
  if (!db) return null;
  try {
    const result = await db.get(`${DbReference.tx}:${txId}`);
    return JSON.parse(result) as TxValidatedResult;
  } catch (e) {
    return null;
  }
};

export const saveTxDb = async (txId: string, result: TxValidatedResult): Promise<void> => {
  if (!db) return;
  try {
    await db.put(`${DbReference.tx}:${txId}`, JSON.stringify(result));
  } catch (error) {
    console.log('error', error);
    throw new Error('`saveTxDb`- Could not write to into the db - critical error!');
  }
};

export const getBlockDb = async (blockNumber: number): Promise<Block | null> => {
  if (!db) return null;
  try {
    const result = await db.get(`${DbReference.block}:${blockNumber}`);
    return JSON.parse(result) as Block;
  } catch (e) {
    return null;
  }
};

export const saveBlockDb = async (block: BlockInfo): Promise<void> => {
  if (!db) return;
  try {
    await db.put(`${DbReference.block}:${block.number}`, JSON.stringify(block));
  } catch (error) {
    console.log('error', error);
    throw new Error('`saveBlockDb` - Could not write to into the db - critical error!');
  }
};

export interface FailedTransactionsDb {
  txId: string;
  reason: ClaimableValidatorError;
  submitter: string;
}

export const getFailedTransactionsDb = async (): Promise<FailedTransactionsDb[]> => {
  if (!db) return [];
  try {
    const result = await db.get(`${DbReference.tx}:failed`);
    return JSON.parse(result) as FailedTransactionsDb[];
  } catch (e) {
    return [];
  }
};

export const saveFailedTransactionDb = async (
  failedTransaction: FailedTransactionsDb
): Promise<void> => {
  if (!db) return;
  try {
    const result = await getFailedTransactionsDb();
    await db.put(`${DbReference.tx}:failed`, JSON.stringify([...result, failedTransaction]));
  } catch (error) {
    throw new Error('Could not write to into the db - critical error!');
  }
};

export const getLastEndCursorDb = async (): Promise<string | null> => {
  if (!db) return null;
  try {
    return await db.get(DbReference.cursor);
  } catch (e) {
    return null;
  }
};

export const saveEndCursorDb = async (cursor: string): Promise<void> => {
  if (!db) return;
  try {
    await db.put(DbReference.cursor, cursor);
  } catch (error) {
    throw new Error('Could not write to into the db - critical error!');
  }
};

export const saveTxDAMetadataDb = async (
  txId: string,
  publication: DAStructurePublication<DAEventType, PublicationTypedData>
): Promise<void> => {
  if (!db) return;
  try {
    await db.put(`${DbReference.tx_da_metadata}:${txId}`, JSON.stringify(publication));
  } catch (error) {
    throw new Error('Could not write to the db - critical error!');
  }
};

export const getTxDAMetadataDb = async (
  txId: string
): Promise<DAStructurePublication<DAEventType, PublicationTypedData> | null> => {
  if (!db) return null;
  try {
    const result = await db.get(`${DbReference.tx_da_metadata}:${txId}`);
    return JSON.parse(result) as DAStructurePublication<DAEventType, PublicationTypedData>;
  } catch (e) {
    return null;
  }
};

export const saveTxTimestampProofsMetadataDb = async (
  txId: string,
  proofs: DATimestampProofsResponse
): Promise<void> => {
  if (!db) return;
  try {
    await db.put(`${DbReference.tx_timestamp_proof_metadata}:${txId}`, JSON.stringify(proofs));
  } catch (error) {
    throw new Error('Could not write to the db - critical error!');
  }
};

export const getTxTimestampProofsMetadataDb = async (
  txId: string
): Promise<DATimestampProofsResponse | null> => {
  if (!db) return null;
  try {
    const result = await db.get(`${DbReference.tx_timestamp_proof_metadata}:${txId}`);
    return JSON.parse(result) as DATimestampProofsResponse;
  } catch (e) {
    return null;
  }
};
