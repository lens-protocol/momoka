import { ChildProcess, exec } from 'child_process';
import { BigNumber } from 'ethers';
import { consoleLogWithLensNodeFootprint } from '../common/logger';
import { JSONRPCWithTimeout } from '../input-output/json-rpc-with-timeout';
import { EthereumNode } from './ethereum';
import { JSONRPCMethods } from './jsonrpc-methods';

const execWrapper = (command: string, callback: Function): ChildProcess => {
  const childProcess = exec(command, { maxBuffer: Infinity });
  return callback(childProcess);
};

const mypromisify =
  (fn: Function) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (...args: any) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    new Promise((resolve) => fn(...args, (...a: any) => resolve(a)));

const execAsync = mypromisify(execWrapper);

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

  const result = await JSONRPCWithTimeout<{ number: string }>(
    LOCAL_NODE_URL,
    JSONRPCMethods.eth_getBlockByNumber,
    ['latest', false]
  );

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

const shutdownAnvilNode = async (): Promise<void> => {
  await execAsync('lsof -t -i tcp:8545 | xargs kill');
};

const closeEventsListeners = (): void => {
  //do something when app is closing
  process.on('exit', shutdownAnvilNode);

  //catches ctrl+c event
  process.on('SIGINT', shutdownAnvilNode);

  // catches "kill pid" (for example: nodemon restart)
  process.on('SIGUSR1', shutdownAnvilNode);
  process.on('SIGUSR2', shutdownAnvilNode);
};

let public_node_url: string | undefined;

/**
 *  Sets up the local node from the fork
 * @param nodeUrl the node url to fork from
 */
export const setupAnvilLocalNode = async (nodeUrl: string): Promise<void> => {
  public_node_url = nodeUrl;
  consoleLogWithLensNodeFootprint('setting up anvil local node from the fork...');

  if (await isAnvilNodeAlive()) {
    consoleLogWithLensNodeFootprint('local node is already up, skipping setup...');
    return;
  }

  consoleLogWithLensNodeFootprint('downloading foundry...');
  await execAsync('curl -L https://foundry.paradigm.xyz | bash');
  consoleLogWithLensNodeFootprint('downloaded foundry...');

  consoleLogWithLensNodeFootprint('foundryup...');
  await execAsync('foundryup');
  consoleLogWithLensNodeFootprint('foundryup complete...');

  // eslint-disable-next-line no-async-promise-executor
  await new Promise<void>(async (resolve, _reject) => {
    const internal = setInterval(async () => {
      consoleLogWithLensNodeFootprint('checking local node status...');
      if (await isAnvilNodeAlive()) {
        consoleLogWithLensNodeFootprint('local node status.. ALIVE');
        clearInterval(internal);
        return resolve();
      }

      consoleLogWithLensNodeFootprint('local node status... STARTING');
    }, 100);

    consoleLogWithLensNodeFootprint('starting up anvil local node from the fork...');
    await execAsync(
      `REQ_TIMEOUT=100000 anvil --fork-url ${nodeUrl} --silent --timeout 1500 --retries 2`
    );
  });

  closeEventsListeners();

  consoleLogWithLensNodeFootprint('complete setup of anvil local node from fork...');
};

/**
 *  Reforks the local node from the archive node new block number
 * @param ethereumNode The ethereum node
 * @param blockNumber The block number to refork from
 */
export const anvilForkFrom = async (
  ethereumNode: EthereumNode,
  blockNumber: number
): Promise<void> => {
  if (!public_node_url) {
    throw new Error('must call setupAnvilLocalNode before you can refork');
  }
  // Reset the fork node to the latest block.
  await JSONRPCWithTimeout<void>(ethereumNode.nodeUrl, JSONRPCMethods.anvil_reset, [
    {
      forking: {
        jsonRpcUrl: public_node_url,
        blockNumber,
      },
    },
  ]);

  setAnvilCurrentBlockNumber(blockNumber);
};
