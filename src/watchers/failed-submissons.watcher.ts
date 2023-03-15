import { sleep } from '../common/helpers';
import { consoleLog } from '../common/logger';
import { ClaimableValidatorError } from '../data-availability-models/claimable-validator-errors';
import { getFailedTransactionsDb, startDb } from '../input-output/db';

/**
 * Watches for failed submissions in the database and logs a summary of the errors.
 * @param dbLocationFolder - The path to the folder containing the database.
 */
export const verifierFailedSubmissionsWatcher = async (dbLocationFolder: string): Promise<void> => {
  consoleLog('LENS VERIFICATION NODE - started up failed submission watcher...');

  // Initialize the database
  startDb(dbLocationFolder);

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const failed = await getFailedTransactionsDb();

      if (failed.length > 0) {
        consoleLog('LENS VERIFICATION NODE - FAILED SUBMISSIONS SUMMARY:');

        const failedResults = [];

        // Count the number of failed submissions for each error reason
        for (const item in ClaimableValidatorError) {
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
