import { promises as fs } from 'fs';
import { sleep } from '../common/helpers';
import { consoleError, consoleLog } from '../common/logger';
import { FAILED_PROOFS_PATHS } from '../input-output/paths';

/**
 * Watches for failed submissions written to disk
 */
export const verifierFailedSubmissionsWatcher = async (): Promise<void> => {
  consoleLog('LENS VERIFICATION NODE - started up failed submission watcher...');

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const files = await fs.readdir(FAILED_PROOFS_PATHS);
      if (files.length > 0) {
        consoleError('Found failed claims - ' + files.length);
      }

      // const failed = await getFailedTransactionsDb();
      // if (dbLocationFolderPath === 'desdf') {
      //   handleRetries(failed, ethereumNode);
      // }
      // const failedResults = [];
      // failedResults.push(['SUCCESS', await getSuccessfulTransactionsTotalDb()]);
      // failedResults.push([
      //   'NETWORK_ISSUES_RETRY_REQUIRED',
      //   failed.filter(
      //     (f) =>
      //       f.reason === ClaimableValidatorError.BLOCK_CANT_BE_READ_FROM_NODE ||
      //       f.reason === ClaimableValidatorError.CAN_NOT_CONNECT_TO_BUNDLR ||
      //       f.reason === ClaimableValidatorError.UNKNOWN
      //   ).length,
      // ]);
      // // Count the number of failed submissions for each error reason
      // for (const item in ClaimableValidatorError) {
      //   if (isNaN(Number(item))) {
      //     if (
      //       item !== ClaimableValidatorError.BLOCK_CANT_BE_READ_FROM_NODE &&
      //       item !== ClaimableValidatorError.CAN_NOT_CONNECT_TO_BUNDLR &&
      //       item !== ClaimableValidatorError.UNKNOWN
      //     )
      //       failedResults.push([item, failed.filter((f) => f.reason === item).length]);
      //   }
      // }
      // console.table(failedResults);
    } catch (error) {
      consoleLog(
        'LENS VERIFICATION NODE - verifier failed watcher failed try again in 5 seconds',
        error
      );
    }

    // every 30 seconds
    await sleep(30000);
  }
};
