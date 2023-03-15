import { sleep } from '../common/helpers';
import { consoleLog } from '../common/logger';
import { EthereumNode, getBlock } from '../evm/ethereum';
import { saveBlockDb } from '../input-output/db';

/**
 * Watches for new blocks on the ethereum node defined and saves them to the database when found.
 * @param ethereumNode The Ethereum node to watch for blocks.
 */
export const cacheBlocksWatcher = async (ethereumNode: EthereumNode): Promise<never> => {
  let blockNumber = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      // Get the latest block.
      const latestBlock = await getBlock('latest', ethereumNode, 1);

      // If the latest block has a greater number than the current block being watched.
      if (latestBlock.number > blockNumber) {
        blockNumber = latestBlock.number;

        // Save the new block to the database.
        saveBlockDb(latestBlock);
      }
    } catch (error) {
      consoleLog(
        'LENS VERIFICATION NODE - Error getting latest block try again in 1 second',
        error
      );
    }

    // Wait for 1 second before checking for new blocks again.
    await sleep(500);
  }
};
