import { Block } from '@ethersproject/abstract-provider';
import { Level } from 'level';
import { ClaimableValidatorError } from './claimable-validator-errors';

let db: Level | undefined;

export enum DbRefernece {
  block = 'block',
  tx = 'tx',
}

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

export const txExistsDb = async (txId: string): Promise<boolean> => {
  if (!db) return false;
  try {
    await db.get(`${DbRefernece.tx}:${txId}`);
    return true;
  } catch (e) {
    return false;
  }
};

export const txSuccessDb = 'success';
type TxSuccessDb = 'success';

export const saveTxDb = async (
  txId: string,
  value: ClaimableValidatorError | TxSuccessDb
): Promise<void> => {
  if (!db) return;
  try {
    await db.put(`${DbRefernece.tx}:${txId}`, value);
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
