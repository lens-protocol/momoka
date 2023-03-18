import { sleep } from '../common/helpers';
import { consoleLog } from '../common/logger';
import { EthereumNode } from '../evm/ethereum';
import { startDb } from '../input-output/db';

/**
 * Watches for failed submissions in the database and logs a summary of the errors.
 * @param dbLocationFolder - The path to the folder containing the database.
 */
export const verifierFailedSubmissionsWatcher = async (
  _ethereumNode: EthereumNode,
  dbLocationFolderPath: string
): Promise<void> => {
  consoleLog('LENS VERIFICATION NODE - started up failed submission watcher...');

  // Initialize the database
  startDb(dbLocationFolderPath);

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
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

    await sleep(1000000000);
  }
};
