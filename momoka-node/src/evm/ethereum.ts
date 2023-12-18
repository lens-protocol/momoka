import { BigNumber, ethers } from 'ethers';
import { Deployment, Environment, environmentToLensHubContract } from '../common/environment';
import { retryWithTimeout } from '../common/helpers';
import { PromiseResult, failure, success } from '../data-availability-models/da-result';
import { MomokaValidatorError } from '../data-availability-models/validator-errors';
import { JSONRPCWithTimeout, RATE_LIMIT_TIME } from '../input-output/json-rpc-with-timeout';
import { JSONRPCMethods } from './jsonrpc-methods';
import { numberToHex } from '../utils/number-to-hex';

export interface EthereumNode {
  environment: Environment;
  nodeUrl: string;
  /**
   * Only if you want to use staging/local environment
   * only use this if you know what you are doing!
   */
  deployment?: Deployment | undefined;
}

export const EMPTY_BYTE = '0x';

/**
 * Executes a simulation transaction on the given Ethereum node.
 * @param data - The transaction data to be executed.
 * @param blockNumber - The block number to use for the transaction.
 * @param ethereumNode - The Ethereum node to use for the transaction.
 * @returns A `DAResult` with the result of the transaction or an error message.
 */
export const executeSimulationTransaction = async (
  data: string,
  blockNumber: number,
  ethereumNode: EthereumNode
): PromiseResult<string> => {
  try {
    return await retryWithTimeout(
      async () => {
        const ethCall = await JSONRPCWithTimeout<string>(
          ethereumNode.nodeUrl,
          JSONRPCMethods.eth_call,
          [
            {
              to: environmentToLensHubContract(ethereumNode.environment),
              data,
            },
            numberToHex(blockNumber),
          ],
          true
        );

        if (!ethCall) {
          throw new Error('eth_call returned undefined');
        }

        return success(ethCall);
      },
      {
        delayMs: RATE_LIMIT_TIME,
      }
    );
  } catch (_error) {
    return failure(MomokaValidatorError.SIMULATION_NODE_COULD_NOT_RUN);
  }
};

/**
 * Check if a block hash exists for potential reorgs
 * @param blockHash - The transaction data to be executed.
 * @param ethereumNode - The Ethereum node to use for the transaction.
 * @returns A `DAResult` with the result of the transaction or an error message.
 */
export const blockHashExists = async (
  blockHash: string,
  ethereumNode: EthereumNode
): PromiseResult<boolean> => {
  try {
    return await retryWithTimeout(
      async () => {
        // this returns a full block so can extend typings if you need anything more
        const block = await JSONRPCWithTimeout<{ transactions: string[] }>(
          ethereumNode.nodeUrl,
          JSONRPCMethods.eth_getBlockByHash,
          [blockHash, false]
        );

        if (!block) {
          return success(false);
        }

        return success(true);
      },
      {
        delayMs: RATE_LIMIT_TIME,
      }
    );
  } catch (_error) {
    return failure(MomokaValidatorError.SIMULATION_NODE_COULD_NOT_RUN);
  }
};

/**
 * Parse an Ethereum signature string and add a deadline timestamp to it.
 * @param signature - The signature string to parse.
 * @param deadline - The deadline timestamp to add to the signature.
 * @returns An object containing the parsed signature and deadline.
 */
export const parseSignature = (
  signature: string,
  deadline: number
): {
  r: string;
  s: string;
  v: number;
  deadline: number;
} => {
  const splitSign = ethers.utils.splitSignature(signature);
  return {
    r: splitSign.r,
    s: splitSign.s,
    v: splitSign.v,
    deadline,
  };
};

export interface BlockInfo {
  number: number;
  timestamp: number;
}

/**
 * Returns information about a block specified by either block hash or block tag
 * @param blockHashOrBlockTag The hash or tag of the block to retrieve information for
 * @param ethereumNode The Ethereum node to use for the request
 * @returns A promise that resolves to an object containing block number and timestamp
 * @throws An error if the request fails and exceeds the maximum number of retries
 */
export const getBlock = async (
  blockHashOrBlockTag: ethers.providers.BlockTag,
  ethereumNode: EthereumNode
): Promise<BlockInfo> => {
  return await retryWithTimeout(
    async () => {
      if (typeof blockHashOrBlockTag === 'number') {
        blockHashOrBlockTag = numberToHex(blockHashOrBlockTag);
      }

      const result: { number: string; timestamp: string } = await JSONRPCWithTimeout(
        ethereumNode.nodeUrl,
        JSONRPCMethods.eth_getBlockByNumber,
        [blockHashOrBlockTag, false]
      );

      return {
        number: BigNumber.from(result.number).toNumber(),
        timestamp: BigNumber.from(result.timestamp).toNumber(),
      };
    },
    {
      delayMs: RATE_LIMIT_TIME,
    }
  );
};
