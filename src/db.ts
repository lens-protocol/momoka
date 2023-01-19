import { Level } from 'level';
import path from 'path';
import { ClaimableValidatorError } from './claimable-validator-errors';

const dbPath = path.join(__dirname, '..', 'database');
const db = new Level(dbPath);

export const existsDb = async (txId: string): Promise<boolean> => {
  try {
    await db.get(`tx:${txId}`);
    return true;
  } catch (e) {
    return false;
  }
};

export const successDb = 'success';
type SuccessDb = 'success';

export const putDb = async (
  txId: string,
  value: ClaimableValidatorError | SuccessDb
): Promise<void> => {
  try {
    await db.put(`tx:${txId}`, value);
  } catch (error) {
    throw new Error('Could not write to into the db - critical error!');
  }
};
