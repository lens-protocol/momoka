import { saveBlockDb } from '../db';
import { ethereumProvider } from '../ethereum';
import { sleep } from '../helpers';
import { consoleLog } from '../logger';

export const watchBlocks = async () => {
  consoleLog('LENS VERIFICATION NODE - started up block watching...');

  let blockNumber = 0;
  while (true) {
    try {
      const latestBlock = await ethereumProvider.getBlock('latest');
      if (latestBlock.number > blockNumber) {
        blockNumber = latestBlock.number;

        // save block fire and forget!
        saveBlockDb(latestBlock);
        consoleLog('LENS VERIFICATION NODE - New block found and saved', blockNumber);
      }
    } catch (error) {
      consoleLog('LENS VERIFICATION NODE - Error getting latest block try again in 100ms', error);
    }

    await sleep(100);
  }
};
