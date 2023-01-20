import { Block } from '@ethersproject/abstract-provider';
import { Level } from 'level';
import path from 'path';
import { ClaimableValidatorError } from './claimable-validator-errors';

const dbPath = path.join(__dirname, '..', 'database');
const db = new Level(dbPath);

enum DbRefernece {
  block = 'block',
  tx = 'tx',
}

export const txExistsDb = async (txId: string): Promise<boolean> => {
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
  try {
    await db.put(`${DbRefernece.tx}:${txId}`, value);
  } catch (error) {
    throw new Error('Could not write to into the db - critical error!');
  }
};

export const getBlockDb = async (blockNumber: number): Promise<Block | null> => {
  try {
    const result = await db.get(`${DbRefernece.block}:${blockNumber}`);
    return JSON.parse(result) as Block;
  } catch (e) {
    return null;
  }
};

export const saveBlockDb = async (block: Block): Promise<void> => {
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
  try {
    const result = await getFailedTransactionsDb();
    await db.put(`${DbRefernece.block}:failed`, JSON.stringify([...result, failedTransaction]));
  } catch (error) {
    throw new Error('Could not write to into the db - critical error!');
  }
};
