import { ethers } from 'ethers';
import {
  DAlensHubInterface,
  getLensHubContract,
  LENS_PROXY_MUMBAI_CONTRACT,
} from './contract-lens/lens-proxy-info';
import { PostWithSig_DispatcherRequest } from './ethereum-abi-types/LensHub';

const network = 'https://polygon-mumbai.g.alchemy.com/v2/lYqDZAMIfEqR6I7a6h6DmgkcP2ran6qW';

export const EMPTY_BYTE = '0x';

const MAIN_NODE_TIMEOUT = 5 * 1000;

export const ethereumProvider = new ethers.providers.StaticJsonRpcProvider(
  {
    url: network,
    // timeout after MAIN_NODE_TIMEOUT
    timeout: MAIN_NODE_TIMEOUT,
    throttleLimit: MAIN_NODE_TIMEOUT,
  },
  80001
);

export const executeSimulationTransaction = async (
  methodName: 'postWithSig_Dispatcher' | 'postWithSig',
  sigRequest: PostWithSig_DispatcherRequest,
  blockNumber: number
) => {
  const transaction: ethers.providers.TransactionRequest = {
    to: LENS_PROXY_MUMBAI_CONTRACT,
    data: DAlensHubInterface.encodeFunctionData(methodName, [sigRequest]),
  };

  // will throw if it did not work!
  await ethereumProvider.call(transaction, blockNumber);
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
