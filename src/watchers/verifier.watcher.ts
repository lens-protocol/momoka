import { checkDAProof } from '../';
import {
  getDataAvailabilityTransactionsAPI,
  getDataAvailabilityTransactionsAPIResponse,
} from '../bundlr/get-data-availability-transactions.api';
import { ClaimableValidatorError } from '../claimable-validator-errors';
import { saveFailedTransactionDb, saveTxDb, startDb, txSuccessDb } from '../db';
import { sleep } from '../helpers';
import { consoleLog } from '../logger';
import { watchBlocks } from './block.watcher';
import { verifierFailedSubmissionsWatcher } from './failed-submissons.watcher';

let _lock = false;
const processFailedSubmissions = async (
  txId: string,
  reason: ClaimableValidatorError,
  log: (message: string, ...optionalParams: any[]) => void
) => {
  while (true) {
    if (_lock) {
      log('process failed submissions already writing, await for the unlock');

      await sleep(100);
    }

    _lock = true;

    await saveFailedTransactionDb({ txId, reason });
    log('process failed submissions saved to db');

    _lock = false;
    break;
  }
};

const checkDAProofsBatch = async (
  arweaveTransactions: getDataAvailabilityTransactionsAPIResponse
): Promise<void> => {
  await Promise.all(
    arweaveTransactions!.edges.map(async (edge) => {
      const txId = edge.node.id;
      const log = (message: string, ...optionalParams: any[]) => {
        consoleLog('\x1b[32m', `LENS VERIFICATION NODE - ${txId} - ${message}`, ...optionalParams);
      };

      try {
        log('Checking submission');

        const result = await checkDAProof(txId, { verifyPointer: true, log });
        // write to the database!
        await saveTxDb(txId, result.isFailure() ? result.failure! : txSuccessDb);

        if (result.isFailure()) {
          // fire and forget
          processFailedSubmissions(txId, result.failure!, log);
        }

        log(
          `${
            result.isFailure()
              ? `FAILED - ${result.failure!}: the checking has flagged invalid DA publication`
              : 'SUCCESS: the checkes have all passed.'
          }`
        );
      } catch (e) {
        await saveTxDb(txId, ClaimableValidatorError.UNKNOWN);
        log('FAILED: the checking has flagged invalid DA publication', e);
      }
    })
  );

  consoleLog('Checked all submissons all is well');
};

export const startDAVerifierNode = async () => {
  consoleLog('LENS VERIFICATION NODE - DA verification watcher started...');

  startDb();

  watchBlocks();
  verifierFailedSubmissionsWatcher();

  let endCursor: string | null = null;

  while (true) {
    consoleLog('LENS VERIFICATION NODE - Checking for new submissions...');

    const arweaveTransactions: getDataAvailabilityTransactionsAPIResponse =
      await getDataAvailabilityTransactionsAPI(endCursor);

    // consoleLog('arweaveTransactions', arweaveTransactions);

    if (arweaveTransactions.edges.length === 0) {
      consoleLog('LENS VERIFICATION NODE - No new items found..');
      await sleep(500);
    } else {
      consoleLog(
        'LENS VERIFICATION NODE - Found new submissions...',
        arweaveTransactions.edges.length
      );

      endCursor = arweaveTransactions.pageInfo.endCursor;

      // fire and forget so we can process as many as we can in concurrently!
      checkDAProofsBatch(arweaveTransactions);

      await sleep(500);
    }
  }
};
