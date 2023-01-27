import { FailedTransactionsDb, getFailedTransactionsDb, startDb } from '../db';
import { sleep } from '../helpers';
import { consoleLog } from '../logger';

export const verifierFailedSubmissionsWatcher = async () => {
  consoleLog('LENS VERIFICATION NODE - started up failed submisson watcher...');

  startDb();

  let seenFailedSubmissions: FailedTransactionsDb[] = [];
  while (true) {
    try {
      const failed = await getFailedTransactionsDb();

      const unseenFailedSubmissions = failed.filter(
        (f) => !seenFailedSubmissions.find((s) => s.txId === f.txId)
      );

      if (unseenFailedSubmissions.length > 0) {
        consoleLog('LENS VERIFICATION NODE - ERROR FOUND', {
          publicationFailed: unseenFailedSubmissions,
        });
      }

      const merged = [...seenFailedSubmissions, ...failed];
      seenFailedSubmissions = [...new Map(merged.map((item) => [item.txId, item])).values()];

      consoleLog('LENS VERIFICATION NODE - finished failed watcher check again in 5 seconds');
    } catch (error) {
      consoleLog(
        'LENS VERIFICATION NODE - verifier failed watcher failed try again in 5 seconds',
        error
      );
    }

    await sleep(5000);
  }
};
