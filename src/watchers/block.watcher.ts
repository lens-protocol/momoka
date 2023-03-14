import { saveBlockDb } from '../db';
import { EthereumNode, ethereumProvider, getBlock } from '../ethereum';
import { sleep } from '../helpers';
import { consoleLog } from '../logger';

export const watchBlocks = async (ethereumNode: EthereumNode) => {
  consoleLog('LENS VERIFICATION NODE - started up block watching...');

  const forkNode = ethereumProvider({ ...ethereumNode, nodeUrl: 'http://127.0.0.1:8545/' }, false)!;

  let blockNumber = 0;
  while (true) {
    try {
      const latestBlock = await getBlock('latest', ethereumNode, 1);
      if (latestBlock.number > blockNumber) {
        blockNumber = latestBlock.number;

        // switch fork node to latest block!
        await forkNode.send('anvil_reset', [
          {
            forking: {
              jsonRpcUrl: ethereumNode.nodeUrl,
              blockNumber,
            },
          },
        ]);

        // save block fire and forget!
        saveBlockDb(latestBlock);
        // consoleLog('LENS VERIFICATION NODE - New block found and saved', blockNumber);
      }
    } catch (error) {
      consoleLog('LENS VERIFICATION NODE - Error getting latest block try again in 100ms', error);
    }

    await sleep(100);
  }
};
