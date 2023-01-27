import { Block } from '@ethersproject/abstract-provider';
import { ethers } from 'ethers';
import { ClaimableValidatorError } from './claimable-validator-errors';
import { getLensHubContract, LENS_PROXY_MUMBAI_CONTRACT } from './contract-lens/lens-proxy-info';
import { failure, PromiseResult, success } from './da-result';
import { sleep } from './helpers';

const network = 'https://polygon-mumbai.g.alchemy.com/v2/lYqDZAMIfEqR6I7a6h6DmgkcP2ran6qW';

export const EMPTY_BYTE = '0x';

const MAIN_NODE_TIMEOUT = 2 * 1000;

export const ethereumProvider = new ethers.providers.StaticJsonRpcProvider(
  {
    url: network,
    // timeout after MAIN_NODE_TIMEOUT
    timeout: MAIN_NODE_TIMEOUT,
    throttleLimit: MAIN_NODE_TIMEOUT,
  },
  80001
);

const MAX_RETRIES_SIMULATION = 3;

export const executeSimulationTransaction = async (
  data: string,
  blockNumber: number,
  attempt = 0
): PromiseResult<string | void> => {
  try {
    const transaction: ethers.providers.TransactionRequest = {
      to: LENS_PROXY_MUMBAI_CONTRACT,
      data,
    };

    const result = await ethereumProvider.call(transaction, blockNumber);

    return success(result);
  } catch (_error) {
    if (attempt < MAX_RETRIES_SIMULATION) {
      await sleep(100);
      return executeSimulationTransaction(data, blockNumber, attempt + 1);
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
  signedByAddress: string
): Promise<{
  sigNonce: number;
  currentPublicationId: string;
  dispatcherAddress: string;
  ownerOfAddress: string;
}> => {
  const lensHubContract = getLensHubContract();
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

const DEFAULT_MAX_BLOCK_RETRIES = 3;

export const getBlock = async (
  blockHashOrBlockTag: ethers.providers.BlockTag,
  maxRetries: number = DEFAULT_MAX_BLOCK_RETRIES,
  attempt: number = 0
): Promise<Block> => {
  try {
    return await ethereumProvider.getBlock(blockHashOrBlockTag);
  } catch (e) {
    if (attempt < DEFAULT_MAX_BLOCK_RETRIES) {
      await sleep(100);
      return getBlock(blockHashOrBlockTag, maxRetries, attempt + 1);
    } else {
      throw e;
    }
  }
};
