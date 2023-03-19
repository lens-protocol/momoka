import { Deployment, Environment } from '../common/environment';
import { runForever, sleep } from '../common/helpers';
import { consoleLog, consoleLogWithLensNodeFootprint } from '../common/logger';
import { LOCAL_NODE_URL, setupAnvilLocalNode } from '../evm/anvil';
import { EthereumNode } from '../evm/ethereum';
import { getDataAvailabilityTransactionsAPI } from '../input-output/bundlr/get-data-availability-transactions.api';
import { getLastEndCursorDb, saveEndCursorDb, startDb } from '../input-output/db';
import { checkDAProofsBatch } from '../proofs/check-da-proofs-batch';
import { retryCheckDAProofsQueue } from '../queue/known.queue';
import { shouldRetry } from '../queue/process-retry-check-da-proofs.queue';
import { startupQueues } from '../queue/startup.queue';
import { verifierFailedSubmissionsWatcher } from './failed-submissons.watcher';
import { StartDAVerifierNodeOptions } from './models/start-da-verifier-node-options';
import { StreamCallback } from './models/stream.type';

/**
 *  Starts up the verifier node
 * @param ethereumNode The Ethereum node to use for verification.
 * @param dbLocationFolderPath The folder path for the location of the database.
 * @param usLocalNode A boolean to indicate whether to use the local node.
 */
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

export interface BulkDataAvailabilityTransactionsResponse {
  next: string | null;
  txIds: string[];
}

/**
 *  Get the bulk data availability transactions from bundlr
 * @param environment The environment to use.
 * @param deployment The deployment to use.
 * @param endCursor  The end cursor to use.
 * @param maxPulling The maximum number of pulling.
 */
const getBulkDataAvailabilityTransactions = async (
  environment: Environment,
  deployment: Deployment | undefined,
  endCursor: string | null,
  maxPulling: number
): Promise<BulkDataAvailabilityTransactionsResponse | null> => {
  const result: BulkDataAvailabilityTransactionsResponse | null = {
    next: endCursor,
    txIds: [],
  };
  let pullingCounter = 0;

  do {
    const response = await getDataAvailabilityTransactionsAPI(environment, deployment, result.next);
    if (response.edges.length === 0) {
      break;
    }

    const txIds = response.edges.map((edge) => edge.node.id);

    result.next = response.pageInfo.endCursor;
    result.txIds.push(...txIds);
    pullingCounter++;
  } while (result.next && pullingCounter < maxPulling);

  return result;
};

const processTransactions = async (
  transactions: BulkDataAvailabilityTransactionsResponse,
  ethereumNode: EthereumNode,
  usLocalNode: boolean,
  stream: StreamCallback | undefined
): Promise<{ totalChecked: number; endCursor: string | null }> => {
  const result = await checkDAProofsBatch(
    transactions.txIds,
    ethereumNode,
    false,
    usLocalNode,
    stream
  );

  const retryTxids = result
    .filter((c) => !c.success && shouldRetry(c.claimableValidatorError!))
    .map((c) => c.txId);

  if (retryTxids.length > 0) {
    retryCheckDAProofsQueue.enqueueWithDelay(
      {
        txIds: retryTxids,
        ethereumNode,
        stream,
      },
      30000
    );
  }

  return {
    totalChecked: result.length - retryTxids.length,
    endCursor: transactions.next,
  };
};

const waitForNewSubmissions = async (
  lastCheckNothingFound: boolean,
  totalChecked: number
): Promise<boolean> => {
  if (!lastCheckNothingFound) {
    consoleLogWithLensNodeFootprint(
      `waiting for new data availability to be submitted... it has checked ${totalChecked} DA publications so far.`
    );
  }
  lastCheckNothingFound = true;
  await sleep(100);
  return lastCheckNothingFound;
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
  let endCursor: string | null = await getLastEndCursorDb();
  let totalChecked = 0;
  let count = 0;
  let lastCheckNothingFound = false;

  consoleLogWithLensNodeFootprint('started up..');

  return await runForever(async () => {
    try {
      const transactions = await getBulkDataAvailabilityTransactions(
        ethereumNode.environment,
        ethereumNode.deployment,
        endCursor,
        10
      );

      if (!transactions || transactions.txIds.length === 0) {
        lastCheckNothingFound = await waitForNewSubmissions(lastCheckNothingFound, totalChecked);
      } else {
        count++;
        lastCheckNothingFound = false;

        consoleLogWithLensNodeFootprint(
          `Resyncing and checking submissons.. ${totalChecked} checked so far`,
          transactions.txIds.length
        );

        const { totalChecked: newTotalChecked, endCursor: newEndCursor } =
          await processTransactions(transactions, ethereumNode, usLocalNode, stream);

        totalChecked += newTotalChecked;
        endCursor = newEndCursor;

        await saveEndCursorDb(endCursor!);
        consoleLog('completed count', count);
      }
    } catch (error) {
      consoleLogWithLensNodeFootprint('Error while checking for new submissions', error);
      await sleep(100);
    }
  });
};
