import { ethers } from 'ethers';
import {
  CommentWithSigRequest,
  MirrorWithSigRequest,
  PostWithSigRequest,
} from './ethereum-abi-types/LensHub';
import { DAlensHubInterface, lensHubContract, LENS_PROXY_MUMBAI_CONTRACT } from './lens-proxy-info';

const network = 'https://polygon-mumbai.g.alchemy.com/v2/lYqDZAMIfEqR6I7a6h6DmgkcP2ran6qW';

export const EMPTY_BYTE = '0X';

export const ethereumProvider = new ethers.providers.StaticJsonRpcProvider(network, 80001);

export const executeSimulationTransaction = async (
  methodName: 'postWithSig' | 'commentWithSig' | 'mirrorWithSig',
  sigRequest: PostWithSigRequest | CommentWithSigRequest | MirrorWithSigRequest,
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
