import { ContractCallContext, Multicall } from 'ethereum-multicall';
import { BigNumber, ethers } from 'ethers';
import { Interface } from 'ethers/lib/utils';
import { Deployment, Environment, environmentToLensHubContract } from '../common/environment';
import { retryWithTimeout } from '../common/helpers';
import { PromiseResult, failure, success } from '../data-availability-models/da-result';
import { MomokaValidatorError } from '../data-availability-models/validator-errors';
import { JSONRPCWithTimeout, RATE_LIMIT_TIME } from '../input-output/json-rpc-with-timeout';
import { LENS_HUB_ABI } from './contract-lens/lens-hub-contract-abi';
import { JSONRPCMethods } from './jsonrpc-methods';

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
 * Does this over ethers call as alchemy and some other providers dont like a padding hex number
 * - wont accept 0x01f1a494
 * - will accept 0x1f1a494
 * @param number
 * @returns
 */
const numberToHex = (number: number): string => {
  return '0x' + number.toString(16);
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

const contractInterface = new ethers.utils.Interface(Multicall.ABI);
/**
 * Fetches on-chain details for a given Lens Profile.
 * @param blockNumber The block number at which to query the contract.
 * @param profileId The ID of the Lens Profile.
 * @param signedByAddress The address of the user who signed the transaction.
 * @param ethereumNode The Ethereum node to use for querying the contract.
 * @returns An object containing the on-chain details of the Lens Profile.
 */
export const getOnChainProfileDetails = async (
  blockNumber: number,
  profileId: string,
  signedByAddress: string,
  ethereumNode: EthereumNode
): PromiseResult<{
  sigNonce: number;
  currentPublicationId: string;
  dispatcherAddress: string;
  ownerOfAddress: string;
}> => {
  // Create a new Multicall instance
  const multicall = new Multicall({
    nodeUrl: ethereumNode.nodeUrl,
    tryAggregate: true,
  });

  // Define the contract call context for the Lens Hub contract.
  const contractCallContext: ContractCallContext = {
    reference: 'onChainProfileDetails',
    contractAddress: environmentToLensHubContract(ethereumNode.environment),
    abi: LENS_HUB_ABI,
    calls: [
      {
        reference: 'sigNonces',
        methodName: 'sigNonces',
        methodParameters: [signedByAddress],
      },
      {
        reference: 'getPubCount',
        methodName: 'getPubCount',
        methodParameters: [profileId],
      },
      {
        reference: 'getDispatcher',
        methodName: 'getDispatcher',
        methodParameters: [profileId],
      },
      {
        reference: 'ownerOf',
        methodName: 'ownerOf',
        methodParameters: [profileId],
      },
    ],
  };

  // we go a bespoke way so we can use our own http library and not ethers
  // to be in full control
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - use internal methods from mutlicall
  const calls = multicall.mapCallContextToMatchContractFormat(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - use internal methods from mutlicall
    multicall.buildAggregateCallContext([contractCallContext])
  );
  const encodedData = contractInterface.encodeFunctionData('tryBlockAndAggregate', [true, calls]);

  try {
    return await retryWithTimeout(
      async () => {
        const result = await JSONRPCWithTimeout<string>(
          ethereumNode.nodeUrl,
          JSONRPCMethods.eth_call,
          [
            {
              // multicall 3 address
              to: '0xcA11bde05977b3631167028862bE2a173976CA11',
              data: encodedData,
            },
            numberToHex(blockNumber),
          ]
        );

        const functionFragment = contractInterface.getFunction('tryBlockAndAggregate');
        const outputTypes = functionFragment.outputs!;

        const decodedResultData = ethers.utils.defaultAbiCoder.decode(outputTypes, result);
        const resultData = decodedResultData[2];

        // bit ugly but we need to decode the return data
        // we know the order of stuff from the above ContractCallContext::calls
        // but as we using a more bespoke approach we can use index here!
        return success({
          sigNonce: BigNumber.from(resultData[0].returnData).toNumber(),
          currentPublicationId: BigNumber.from(resultData[1].returnData).toHexString(),
          dispatcherAddress: ethers.utils.defaultAbiCoder.decode(
            ['address'],
            resultData[2].returnData
          )[0],
          ownerOfAddress: ethers.utils.defaultAbiCoder.decode(
            ['address'],
            resultData[3].returnData
          )[0],
        });
      },
      {
        delayMs: RATE_LIMIT_TIME,
      }
    );
  } catch (_error) {
    return failure(MomokaValidatorError.DATA_CANT_BE_READ_FROM_NODE);
  }
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

/**
 * The Lens Hub smart contract interface.
 */
export const DAlensHubInterface = new Interface(LENS_HUB_ABI);

/**
 * Returns the number of published data availability proofs for a given profile ID and block number.
 * @param profileId The profile ID to retrieve the published proof count for.
 * @param blockNumber The block number to retrieve the published proof count at.
 * @param ethereumNode The Ethereum node to connect to.
 * @returns The number of published data availability proofs for the specified profile ID and block number.
 */
export const getLensPubCount = async (
  profileId: string,
  blockNumber: number,
  ethereumNode: EthereumNode
): PromiseResult<BigNumber> => {
  const encodedData = DAlensHubInterface.encodeFunctionData('getPubCount', [profileId]);

  try {
    return await retryWithTimeout(
      async () => {
        const ethCall = await JSONRPCWithTimeout<string>(
          ethereumNode.nodeUrl,
          JSONRPCMethods.eth_call,
          [
            {
              to: environmentToLensHubContract(ethereumNode.environment),
              data: encodedData,
            },
            numberToHex(blockNumber),
          ]
        );

        if (!ethCall) {
          throw new Error('eth_call returned undefined');
        }

        return success(BigNumber.from(ethCall));
      },
      {
        delayMs: RATE_LIMIT_TIME,
      }
    );
  } catch (_error) {
    return failure(MomokaValidatorError.DATA_CANT_BE_READ_FROM_NODE);
  }
};
