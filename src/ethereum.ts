import { Block } from '@ethersproject/abstract-provider';
import { ethers } from 'ethers';
import { ClaimableValidatorError } from './claimable-validator-errors';
import { getLensHubContract } from './contract-lens/lens-proxy-info';
import { failure, PromiseResult, success } from './da-result';
import {
  Deployment,
  Environment,
  environmentToChainId,
  environmentToLensHubContract,
} from './environment';
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

const MAIN_NODE_TIMEOUT = 5 * 1000;

export const ethereumProvider = (ethereumNode: EthereumNode): EthereumProvider => {
  if (_ethereumProviders[ethereumNode.environment]) {
    return _ethereumProviders[ethereumNode.environment]!;
  }

  const provider = new ethers.providers.StaticJsonRpcProvider(
    {
      url: ethereumNode.nodeUrl,
      timeout: MAIN_NODE_TIMEOUT,
      throttleLimit: MAIN_NODE_TIMEOUT,
    },
    environmentToChainId(ethereumNode.environment)
  );

  return (_ethereumProviders[ethereumNode.environment] = provider);
};

const MAX_RETRIES_SIMULATION = 10;

export const executeSimulationTransaction = async (
  data: string,
  blockNumber: number,
  ethereumNode: EthereumNode,
  attempt = 0
): PromiseResult<string | void> => {
  try {
    const transaction: ethers.providers.TransactionRequest = {
      to: environmentToLensHubContract(ethereumNode.environment),
      data,
    };

    const result = await ethereumProvider(ethereumNode)!.call(transaction, blockNumber);

    return success(result);
  } catch (_error) {
    if (attempt < MAX_RETRIES_SIMULATION) {
      await sleep(500);
      return await executeSimulationTransaction(data, blockNumber, ethereumNode, attempt + 1);
    }
    return failure(ClaimableValidatorError.SIMULATION_NODE_COULD_NOT_RUN);
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
  const lensHubContract = getLensHubContract(ethereumNode);
  // get the current sig nonce of signed by address
  // get the current publication count
  // get the current dispatcher address
  // get the current owner address
  const [sigNonce, currentPublicationId, dispatcherAddress, ownerOfAddress] = await Promise.all([
    lensHubContract.sigNonces(signedByAddress, { blockTag: blockNumber }),
    lensHubContract.getPubCount(profileId, { blockTag: blockNumber }),
    lensHubContract.getDispatcher(profileId, { blockTag: blockNumber }),
    lensHubContract.ownerOf(profileId, { blockTag: blockNumber }),
  ]);

  return {
    sigNonce: sigNonce.toNumber(),
    currentPublicationId: currentPublicationId.toHexString(),
    dispatcherAddress,
    ownerOfAddress,
  };
};

const DEFAULT_MAX_BLOCK_RETRIES = 10;

export const getBlock = async (
  blockHashOrBlockTag: ethers.providers.BlockTag,
  ethereumNode: EthereumNode,
  maxRetries: number = DEFAULT_MAX_BLOCK_RETRIES,
  attempt: number = 0
): Promise<Block> => {
  try {
    return await ethereumProvider(ethereumNode)!.getBlock(blockHashOrBlockTag);
  } catch (e) {
    if (attempt < DEFAULT_MAX_BLOCK_RETRIES) {
      await sleep(200);
      return await getBlock(blockHashOrBlockTag, ethereumNode, maxRetries, attempt + 1);
    } else {
      throw e;
    }
  }
};
