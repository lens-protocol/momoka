import { ChildProcess, exec } from 'child_process';
import { BigNumber } from 'ethers';
import { promisify } from 'util';
import { consoleLog } from '../common/logger';
import { JSONRPCWithTimeout } from '../input-output/json-rpc-with-timeout';
import { EthereumNode, EthereumProvider, ethereumProvider } from './ethereum';

const execWrapper = (command: string): ChildProcess => {
  return exec(command, { maxBuffer: Infinity });
};

const execAsync = promisify(execWrapper);

export const LOCAL_NODE_URL = 'http://127.0.0.1:8545/';

let _cached_anvil_current_block_number: number | undefined = undefined;
const setAnvilCurrentBlockNumber = (blockNumber: number): void => {
  _cached_anvil_current_block_number = blockNumber;
};

/**
 *  Get anvil node current block number
 */
export const getAnvilCurrentBlockNumber = async (): Promise<number> => {
  if (_cached_anvil_current_block_number) {
    return _cached_anvil_current_block_number;
  }

  const result = await JSONRPCWithTimeout<{ number: string }>(LOCAL_NODE_URL, {
    id: 0,
    jsonrpc: '2.0',
    method: 'eth_getBlockByNumber',
    params: ['latest', false],
  });

  const blockNumber = BigNumber.from(result.number).toNumber();
  setAnvilCurrentBlockNumber(blockNumber);

  return blockNumber;
};

/**
 * Checks if the anvil node is alive aka up and running
 * @returns true if the anvil node is alive
 */
const isAnvilNodeAlive = async (): Promise<boolean> => {
  try {
    // will throw if not up
    await getAnvilCurrentBlockNumber();
  } catch (e) {
    return false;
  }

  return true;
};

const anvilEthereumProvider = (ethereumNode: EthereumNode): EthereumProvider => {
  return ethereumProvider({ ...ethereumNode, nodeUrl: LOCAL_NODE_URL }, false)!;
};

let public_node_url: string | undefined;

/**
 *  Sets up the local node from the fork
 * @param nodeUrl the node url to fork from
 */
export const setupAnvilLocalNode = async (nodeUrl: string): Promise<void> => {
  public_node_url = nodeUrl;
  consoleLog('LENS VERIFICATION NODE - setting up anvil local node from the fork...');

  if (await isAnvilNodeAlive()) {
    consoleLog('LENS VERIFICATION NODE - local node is already up, skipping setup...');
    return;
  }

  consoleLog('LENS VERIFICATION NODE - downloading foundry...');
  await execAsync('curl -L https://foundry.paradigm.xyz | bash');
  consoleLog('LENS VERIFICATION NODE - downloaded foundry...');

  consoleLog('LENS VERIFICATION NODE - foundryup...');
  await execAsync('foundryup');
  consoleLog('LENS VERIFICATION NODE - foundryup complete...');

  // eslint-disable-next-line no-async-promise-executor
  await new Promise<void>(async (resolve, _reject) => {
    const internal = setInterval(async () => {
      consoleLog('LENS VERIFICATION NODE - checking local node status...');
      if (await isAnvilNodeAlive()) {
        consoleLog('LENS VERIFICATION NODE - local node status.. ALIVE');
        clearInterval(internal);
        return resolve();
      }

      consoleLog('LENS VERIFICATION NODE - local node status... STARTING');
    }, 100);

    consoleLog('LENS VERIFICATION NODE - starting up anvil local node from the fork...');
    await execAsync(`REQ_TIMEOUT=100000 anvil --fork-url ${nodeUrl} --silent --no-rate-limit`);
  });

  consoleLog('LENS VERIFICATION NODE - complete setup of anvil local node from fork...');
};

export const anvilForkFrom = async (
  ethereumNode: EthereumNode,
  blockNumber: number
): Promise<void> => {
  if (!public_node_url) {
    throw new Error('must call setupAnvilLocalNode before you can refork');
  }
  // Reset the fork node to the latest block.
  await anvilEthereumProvider(ethereumNode)!.send('anvil_reset', [
    {
      forking: {
        jsonRpcUrl: public_node_url,
        blockNumber,
      },
    },
  ]);

  setAnvilCurrentBlockNumber(blockNumber);
};
