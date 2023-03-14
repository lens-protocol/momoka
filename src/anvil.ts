import { promisify } from 'util';
import { JSONRPCWithTimeout } from './fetch-with-timeout';
import { consoleLog } from './logger';

const exec = promisify(require('child_process').exec);

export const LOCAL_NODE_URL = 'http://127.0.0.1:8545/';

const isLocalNodeAlive = async (): Promise<boolean> => {
  try {
    // will throw if not up
    await JSONRPCWithTimeout(LOCAL_NODE_URL, {
      id: 0,
      jsonrpc: '2.0',
      method: 'eth_getBlockByNumber',
      params: ['latest', false],
    });
  } catch (e) {
    return false;
  }

  return true;
};

export const setupAnvilLocalNode = async (nodeUrl: string) => {
  consoleLog('LENS VERIFICATION NODE - setting up anvil local node from the fork...');

  if (await isLocalNodeAlive()) {
    consoleLog('LENS VERIFICATION NODE - local node is already up, skipping setup...');
    return;
  }

  consoleLog('LENS VERIFICATION NODE - downloading foundry...');
  await exec('curl -L https://foundry.paradigm.xyz | bash');
  consoleLog('LENS VERIFICATION NODE - downloaded foundry...');

  consoleLog('LENS VERIFICATION NODE - foundryup...');
  await exec('foundryup');
  consoleLog('LENS VERIFICATION NODE - foundryup complete...');

  await new Promise<void>(async (resolve, _reject) => {
    const internal = setInterval(async () => {
      consoleLog('LENS VERIFICATION NODE - checking local node status...');
      if (await isLocalNodeAlive()) {
        consoleLog('LENS VERIFICATION NODE - local node status.. ALIVE');
        clearInterval(internal);
        return resolve();
      }

      consoleLog('LENS VERIFICATION NODE - local node status... STARTING');
    }, 100);

    consoleLog('LENS VERIFICATION NODE - starting up anvil local node from the fork...');
    await exec(`REQ_TIMEOUT=100000 anvil -f ${nodeUrl}`);
  });

  consoleLog('LENS VERIFICATION NODE - complete setup of anvil local node from fork...');
};
