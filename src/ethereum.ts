import { ContractCallContext, ContractCallResults, Multicall } from 'ethereum-multicall';
import { BigNumber, ethers } from 'ethers';
import { ClaimableValidatorError } from './claimable-validator-errors';
import { LENS_HUB_ABI } from './contract-lens/lens-hub-contract-abi';
import { failure, PromiseResult, success } from './da-result';
import {
  Deployment,
  Environment,
  environmentToChainId,
  environmentToLensHubContract,
} from './environment';
import { JSONRPCWithTimeout } from './fetch-with-timeout';
import { sleep } from './helpers';

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

type EthereumProvider = ethers.providers.StaticJsonRpcProvider | undefined;

const _ethereumProviders: {
  POLYGON: EthereumProvider;
  MUMBAI: EthereumProvider;
  SANDBOX: EthereumProvider;
} = {
  POLYGON: undefined,
  MUMBAI: undefined,
  SANDBOX: undefined,
};

export const ethereumProvider = (ethereumNode: EthereumNode, cache = false): EthereumProvider => {
  if (_ethereumProviders[ethereumNode.environment] && cache) {
    return _ethereumProviders[ethereumNode.environment]!;
  }

  const provider = new ethers.providers.StaticJsonRpcProvider(
    ethereumNode.nodeUrl,
    environmentToChainId(ethereumNode.environment)
  );

  if (cache) {
    return (_ethereumProviders[ethereumNode.environment] = provider);
  }

  return provider;
};

const MAX_RETRIES_SIMULATION = 10;

export const executeSimulationTransaction = async (
  data: string,
  blockNumber: number,
  ethereumNode: EthereumNode
): PromiseResult<string | void> => {
  let attempt = 0;
  while (true) {
    try {
      const transaction: ethers.providers.TransactionRequest = {
        to: environmentToLensHubContract(ethereumNode.environment),
        data,
      };

      const result = await ethereumProvider(ethereumNode)!.call(transaction, blockNumber);

      return success(result);
    } catch (_error) {
      if (attempt < MAX_RETRIES_SIMULATION) {
        await sleep(Math.floor(Math.random() * (900 - 300 + 1) + 300));
        attempt++;
      } else {
        return failure(ClaimableValidatorError.SIMULATION_NODE_COULD_NOT_RUN);
      }
    }
  }
};

export const parseSignature = (signature: string, deadline: number) => {
  const splitSign = ethers.utils.splitSignature(signature);
  return {
    r: splitSign.r,
    s: splitSign.s,
    v: splitSign.v,
    deadline,
  };
};

export const getOnChainProfileDetails = async (
  blockNumber: number,
  profileId: string,
  signedByAddress: string,
  ethereumNode: EthereumNode
): Promise<{
  sigNonce: number;
  currentPublicationId: string;
  dispatcherAddress: string;
  ownerOfAddress: string;
}> => {
  const multicall = new Multicall({
    ethersProvider: ethereumProvider(ethereumNode)!,
    tryAggregate: true,
  });

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

  const { results }: ContractCallResults = await multicall.call(contractCallContext, {
    blockNumber: String(blockNumber),
  });

  const onChainProfileDetails = results.onChainProfileDetails;

  return {
    sigNonce: BigNumber.from(
      onChainProfileDetails.callsReturnContext[0].returnValues[0]
    ).toNumber(),
    currentPublicationId: BigNumber.from(
      onChainProfileDetails.callsReturnContext[1].returnValues[0]
    ).toHexString(),
    dispatcherAddress: onChainProfileDetails.callsReturnContext[2].returnValues[0],
    ownerOfAddress: onChainProfileDetails.callsReturnContext[3].returnValues[0],
  };
};

const DEFAULT_MAX_BLOCK_RETRIES = 10;

export interface BlockInfo {
  number: number;
  timestamp: number;
}

export const getBlock = async (
  blockHashOrBlockTag: ethers.providers.BlockTag,
  ethereumNode: EthereumNode,
  maxRetries: number = DEFAULT_MAX_BLOCK_RETRIES,
  attempt: number = 0
): Promise<BlockInfo> => {
  try {
    if (typeof blockHashOrBlockTag === 'number') {
      blockHashOrBlockTag = BigNumber.from(blockHashOrBlockTag).toHexString();
    }

    const result: { number: string; timestamp: string } = await JSONRPCWithTimeout(
      ethereumNode.nodeUrl,
      {
        id: 550,
        jsonrpc: '2.0',
        method: 'eth_getBlockByNumber',
        params: [blockHashOrBlockTag, false],
      }
    );

    return {
      number: BigNumber.from(result.number).toNumber(),
      timestamp: BigNumber.from(result.timestamp).toNumber(),
    };
  } catch (e) {
    if (attempt < DEFAULT_MAX_BLOCK_RETRIES) {
      await sleep(200);
      return await getBlock(blockHashOrBlockTag, ethereumNode, maxRetries, attempt + 1);
    } else {
      throw e;
    }
  }
};
