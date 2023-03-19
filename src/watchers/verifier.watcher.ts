import { runForever, sleep } from '../common/helpers';
import { consoleLog, consoleLogWithLensNodeFootprint } from '../common/logger';
import { LOCAL_NODE_URL, setupAnvilLocalNode } from '../evm/anvil';
import { EthereumNode } from '../evm/ethereum';
import {
  getDataAvailabilityTransactionsAPI,
  getDataAvailabilityTransactionsAPIResponse,
} from '../input-output/bundlr/get-data-availability-transactions.api';
import { getLastEndCursorDb, saveEndCursorDb, startDb } from '../input-output/db';
import { checkDAProofsBatch } from '../proofs/check-da-proofs-batch';
import { retryCheckDAProofsQueue } from '../queue/known.queue';
import { shouldRetry } from '../queue/process-retry-check-da-proofs.queue';
import { startupQueues } from '../queue/startup.queue';
import { verifierFailedSubmissionsWatcher } from './failed-submissons.watcher';
import { StartDAVerifierNodeOptions } from './models/start-da-verifier-node-options';

const startup = async (
  ethereumNode: EthereumNode,
  dbLocationFolderPath: string,
  usLocalNode: boolean
): Promise<void> => {
  if (usLocalNode) {
    // Start the local node up
    await setupAnvilLocalNode(ethereumNode.nodeUrl);
  }

  // Initialize database.
  startDb(dbLocationFolderPath);
  startupQueues();
  verifierFailedSubmissionsWatcher();

  if (usLocalNode) {
    // Switch to local node.
    ethereumNode.nodeUrl = LOCAL_NODE_URL;
  }

  console.log(`
  _     _____ _   _ ____    ____    _    
 | |   | ____|  || | ___|  |  _ \\  / \\   
 | |   |  _| |  \\| |___ \\  | | | |/ _ \\  
 | |___| |___| |  |___) | | |_| / ___ \\ 
 |_____|_____|_| \\_|____/  |____/_/   \\_\\                                                      
  `);
};

/**
 * Starts the DA verifier node to watch for new data availability submissions and verify their proofs.
 * @param ethereumNode The Ethereum node to use for verification.
 * @param dbLocationFolderPath The folder path for the location of the database.
 * @param options An optional object containing options for the node.
 *                   - stream - A callback function to stream the validation results.
 *                   - syncFromHeadOnly - A boolean to indicate whether to sync from the head of the chain only.
 */
export const startDAVerifierNode = async (
  ethereumNode: EthereumNode,
  dbLocationFolderPath: string,
  usLocalNode = false,
  { stream }: StartDAVerifierNodeOptions = {}
): Promise<never> => {
  consoleLogWithLensNodeFootprint('DA verification watcher started...');

  await startup(ethereumNode, dbLocationFolderPath, usLocalNode);

  // Get the last end cursor.
  let endCursor: string | null = await getLastEndCursorDb();
  let count = 0;
  let lastCheckNothingFound = false;

  consoleLogWithLensNodeFootprint('started up..');

  console.time('resync complete');

  return await runForever(async () => {
    try {
      console.time('getDataAvailabilityTransactionsAPI');
      // Get new data availability transactions from the server.
      const arweaveTransactions: getDataAvailabilityTransactionsAPIResponse =
        await getDataAvailabilityTransactionsAPI(
          ethereumNode.environment,
          ethereumNode.deployment,
          endCursor
        );
      console.timeEnd('getDataAvailabilityTransactionsAPI');

      if (arweaveTransactions.edges.length === 0) {
        if (!lastCheckNothingFound) {
          console.timeEnd('resync complete');
          consoleLogWithLensNodeFootprint('waiting for new data availability to be submitted...');
        }
        lastCheckNothingFound = true;
        await sleep(100);
      } else {
        count++;
        lastCheckNothingFound = false;
        consoleLogWithLensNodeFootprint(
          'Found new submissions...',
          arweaveTransactions.edges.length
        );

        // Check DA proofs in batches of 1000 to avoid I/O issues.
        console.time('starting');
        const result = await checkDAProofsBatch(
          arweaveTransactions.edges.map((edge) => edge.node.id),
          ethereumNode,
          false,
          usLocalNode,
          stream
        );
        console.timeEnd('starting');

        const retryTxids = result
          .filter((c) => !c.success && shouldRetry(c.claimableValidatorError!))
          .map((c) => c.txId);

        if (retryTxids.length > 0) {
          // push the retry queue
          retryCheckDAProofsQueue.enqueueWithDelay(
            {
              txIds: retryTxids,
              ethereumNode,
              stream,
            },
            // try again in 30 seconds any failed ones
            30000
          );
        }

        consoleLog('result done!', count);

        endCursor = arweaveTransactions.pageInfo.endCursor;
        await saveEndCursorDb(endCursor!);

        consoleLog('completed count', count);
      }
    } catch (error) {
      consoleLogWithLensNodeFootprint('Error while checking for new submissions', error);
      await sleep(100);
    }
  });
};
