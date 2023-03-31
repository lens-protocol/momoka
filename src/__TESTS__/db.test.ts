import { ClaimableValidatorError, TxValidatedResult } from '..';
import { getBlockDb, getTxDb, saveBlockDb, saveTxDb, startDb } from '../input-output/db';
import { random } from './mocks/shared.mock';

describe('db', () => {
  const txValidatedResult: TxValidatedResult = {
    success: false,
    proofTxId: random(),
    failureReason: ClaimableValidatorError.BLOCK_CANT_BE_READ_FROM_NODE,
    dataAvailabilityResult: undefined,
  };

  beforeAll(async () => {
    await startDb();
  });

  describe('getTxDb', () => {
    test('should return back false if tx does not exist', async () => {
      const txId = random();
      const result = await getTxDb(txId);
      expect(result).toBeNull();
    });

    test('should return back true if tx exists', async () => {
      const txId = random();
      await saveTxDb(txId, txValidatedResult);
      const result = await getTxDb(txId);
      expect(result).toEqual(txValidatedResult);
    });
  });

  describe('saveTxDb', () => {
    test('should save to db', async () => {
      const txId = random();
      await saveTxDb(txId, txValidatedResult);
      const result = await getTxDb(txId);
      expect(result).toEqual(txValidatedResult);
    });
  });

  describe('getBlockDb + saveBlockDb', () => {
    test('should return null if nothing found', async () => {
      const ran = random();
      const result = await getBlockDb(ran as any);
      expect(result).toEqual(null);
    });

    test('should return value if found', async () => {
      const ran = random();
      const block = { number: ran as any } as any;

      await saveBlockDb(block);

      const result = await getBlockDb(ran as any);
      expect(result).toEqual(block);
    });
  });
});
