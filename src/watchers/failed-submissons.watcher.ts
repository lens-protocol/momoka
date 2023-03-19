import { existsSync, promises as fs } from 'fs';
import path from 'path';
import { runForever, sleep } from '../common/helpers';
import { consoleLog } from '../common/logger';
import { ClaimableValidatorError } from '../data-availability-models/claimable-validator-errors';
import { FAILED_PROOFS_PATHS } from '../input-output/paths';
import { shouldRetry } from '../queue/process-retry-check-da-proofs.queue';

/**
 * Watches for failed submissions written to disk
 */
export const verifierFailedSubmissionsWatcher = async (): Promise<void> => {
  consoleLog('LENS VERIFICATION NODE - started up failed submission watcher...');

  let firstRun = true;
  await runForever(async () => {
    if (firstRun) {
      firstRun = false;
    } else {
      try {
        const failedResults = [];
        // Count the number of failed submissions for each error reason
        for (const item in ClaimableValidatorError) {
          if (isNaN(Number(item))) {
            if (!shouldRetry(item as ClaimableValidatorError)) {
              const errorPath = path.join(FAILED_PROOFS_PATHS, item);
              const errorCount = existsSync(errorPath)
                ? (await fs.readdir(path.join(FAILED_PROOFS_PATHS, item))).length
                : 0;

              failedResults.push([item, errorCount]);
            }
          }
        }
        console.table(failedResults);
      } catch (error) {
        consoleLog(
          'LENS VERIFICATION NODE - verifier failed watcher failed try again in 5 seconds',
          error
        );
      }
    }

    // every 30 seconds
    await sleep(5000);
  });
};
