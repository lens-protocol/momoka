import { Block } from '@ethersproject/abstract-provider';
import { Level } from 'level';
import { ClaimableValidatorError } from './claimable-validator-errors';
import {
  DAEventType,
  DAStructurePublication,
  PublicationTypedData,
} from './data-availability-models/publications/data-availability-structure-publication';

let db: Level | undefined;

export enum DbRefernece {
  block = 'block',
  tx = 'tx',
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
}

export interface TxValidatedSuccessResult
  extends TxValidatedResultBase<true, DAStructurePublication<DAEventType, PublicationTypedData>> {}

export const startDb = () => {
  if (db) return;

  const path = require('path');
  const dbPath = path.join(__dirname, '..', 'database');
  db = new Level(dbPath);
};

export const deleteDb = (key: string) => {
  if (!db) return;
  return db.del(key);
};

export const getTxDb = async (txId: string): Promise<TxValidatedResult | null> => {
  if (!db) return null;
  try {
    const result = await db.get(`${DbRefernece.tx}:${txId}`);
    return JSON.parse(result) as TxValidatedResult;
  } catch (e) {
    return null;
  }
};

export const saveTxDb = async (txId: string, result: TxValidatedResult): Promise<void> => {
  if (!db) return;
  try {
    await db.put(`${DbRefernece.tx}:${txId}`, JSON.stringify(result));
  } catch (error) {
    throw new Error('Could not write to into the db - critical error!');
  }
};

export const getBlockDb = async (blockNumber: number): Promise<Block | null> => {
  if (!db) return null;
  try {
    const result = await db.get(`${DbRefernece.block}:${blockNumber}`);
    return JSON.parse(result) as Block;
  } catch (e) {
    return null;
  }
};

export const saveBlockDb = async (block: Block): Promise<void> => {
  if (!db) return;
  try {
    await db.put(`${DbRefernece.block}:${block.number}`, JSON.stringify(block));
  } catch (error) {
    throw new Error('Could not write to into the db - critical error!');
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
    const result = await db.get(`${DbRefernece.block}:failed`);
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
    await db.put(`${DbRefernece.block}:failed`, JSON.stringify([...result, failedTransaction]));
  } catch (error) {
    throw new Error('Could not write to into the db - critical error!');
  }
};
