import { ClaimableValidatorError } from '../claimable-validator-errors';
import { getFailedTransactionsDb, startDb } from '../db';
import { sleep } from '../helpers';
import { consoleLog } from '../logger';

export const verifierFailedSubmissionsWatcher = async (dbLocationFolder: string) => {
  consoleLog('LENS VERIFICATION NODE - started up failed submisson watcher...');

  startDb(dbLocationFolder);

  while (true) {
    try {
      const failed = await getFailedTransactionsDb();

      if (failed.length > 0) {
        consoleLog('LENS VERIFICATION NODE - FAILED SUBMISSONS SUMMARY:');

        const failedResults = [];

        for (let item in ClaimableValidatorError) {
          if (isNaN(Number(item))) {
            failedResults.push([item, failed.filter((f) => f.reason === item).length]);
          }
        }

        console.table(failedResults);

        // consoleLog('LENS VERIFICATION NODE - finished failed watcher check again in 5 seconds');
      }
    } catch (error) {
      consoleLog(
        'LENS VERIFICATION NODE - verifier failed watcher failed try again in 5 seconds',
        error
      );
    }

    await sleep(60000);
  }
};
