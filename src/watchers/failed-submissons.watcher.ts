import { ClaimableValidatorError } from '../claimable-validator-errors';
import { getFailedTransactionsDb, startDb } from '../db';
import { sleep } from '../helpers';
import { consoleLog } from '../logger';

/**
 * Watches for failed submissions in the database and logs a summary of the errors.
 * @param dbLocationFolder - The path to the folder containing the database.
 */
export const verifierFailedSubmissionsWatcher = async (dbLocationFolder: string): Promise<void> => {
  consoleLog('LENS VERIFICATION NODE - started up failed submission watcher...');

  // Initialize the database
  startDb(dbLocationFolder);

  while (true) {
    try {
      const failed = await getFailedTransactionsDb();

      if (failed.length > 0) {
        consoleLog('LENS VERIFICATION NODE - FAILED SUBMISSIONS SUMMARY:');

        const failedResults = [];

        // Count the number of failed submissions for each error reason
        for (let item in ClaimableValidatorError) {
          if (isNaN(Number(item))) {
            failedResults.push([item, failed.filter((f) => f.reason === item).length]);
          }
        }

        console.table(failedResults);
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
