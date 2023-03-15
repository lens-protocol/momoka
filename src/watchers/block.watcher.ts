import { sleep } from '../common/helpers';
import { consoleLog } from '../common/logger';
import { LOCAL_NODE_URL } from '../evm/anvil';
import { EthereumNode, ethereumProvider, getBlock } from '../evm/ethereum';
import { saveBlockDb } from '../input-output/db';

/**
 * Watches for new blocks on the Ethereum network and saves them to the database.
 * @param ethereumNode The Ethereum node to watch for blocks.
 */
export const watchBlocks = async (ethereumNode: EthereumNode): Promise<never> => {
  consoleLog('LENS VERIFICATION NODE - started up block watching...');

  // Initialize a forked node to the provided Ethereum node's URL.
  const forkNode = ethereumProvider({ ...ethereumNode, nodeUrl: LOCAL_NODE_URL }, false)!;

  let blockNumber = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      // Get the latest block.
      const latestBlock = await getBlock('latest', ethereumNode, 1);

      // If the latest block has a greater number than the current block being watched.
      if (latestBlock.number > blockNumber) {
        blockNumber = latestBlock.number;

        // Reset the fork node to the latest block.
        await forkNode.send('anvil_reset', [
          {
            forking: {
              jsonRpcUrl: ethereumNode.nodeUrl,
              blockNumber,
            },
          },
        ]);

        // Save the new block to the database.
        saveBlockDb(latestBlock);

        // Log that a new block has been saved.
        consoleLog('LENS VERIFICATION NODE - New block found and saved', blockNumber);
      }
    } catch (error) {
      // If there was an error getting the latest block, log the error and try again in 100ms.
      consoleLog('LENS VERIFICATION NODE - Error getting latest block try again in 100ms', error);
    }

    // Wait for 100ms before checking for new blocks again.
    await sleep(100);
  }
};
