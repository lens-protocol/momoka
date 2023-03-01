import { ClaimableValidatorError } from '../claimable-validator-errors';
import {
  DbRefernece,
  deleteDb,
  FailedTransactionsDb,
  getBlockDb,
  getFailedTransactionsDb,
  getTxDb,
  saveBlockDb,
  saveFailedTransactionDb,
  saveTxDb,
  startDb,
  TxValidatedResult,
} from '../db';
import { random } from './shared-helpers';

describe('db', () => {
  beforeEach(() => {
    startDb();
  });

  const txValidatedResult: TxValidatedResult = {
    success: false,
    proofTxId: random(),
    failureReason: ClaimableValidatorError.BLOCK_CANT_BE_READ_FROM_NODE,
    dataAvailabilityResult: undefined,
  };

  describe('getTxDb', () => {
    test('should return back false if tx does not exist', async () => {
      const txId = random();
      const result = await getTxDb(txId);
      expect(result).toEqual(null);
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

  describe('getFailedTransactionsDb + saveFailedTransactionDb', () => {
    test('should return empty array if nothing found', async () => {
      await deleteDb(`${DbRefernece.block}:failed`);

      const result = await getFailedTransactionsDb();
      expect(result).toEqual([]);
    });

    test('should return value if found', async () => {
      await deleteDb(`${DbRefernece.block}:failed`);

      const failedTx: FailedTransactionsDb = {
        txId: random(),
        reason: ClaimableValidatorError.EVENT_MISMATCH,
        submitter: random(),
      };

      await saveFailedTransactionDb(failedTx);

      const result = await getFailedTransactionsDb();
      expect(result).toHaveLength(1);

      const [first] = result;
      expect(first).toEqual(failedTx);
    });
  });
});
