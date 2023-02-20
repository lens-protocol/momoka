import { BigNumber, ethers } from 'ethers';
import { Interface } from 'ethers/lib/utils';
import { environmentToLensHubContract } from '../environment';
import { EthereumNode, ethereumProvider } from '../ethereum';
import { LensHub } from '../ethereum-abi-types/LensHub';
import { LENS_HUB_ABI } from './lens-hub-contract-abi';

type LensHubType = LensHub | undefined;
const _lensHubCached: {
  POLYGON: LensHubType;
  MUMBAI: LensHubType;
  SANDBOX: LensHubType;
} = {
  POLYGON: undefined,
  MUMBAI: undefined,
  SANDBOX: undefined,
};

export const getLensHubContract = (ethereumNode: EthereumNode): LensHub => {
  if (_lensHubCached[ethereumNode.environment]) {
    return _lensHubCached[ethereumNode.environment]!;
  }

  const contract = new ethers.Contract(
    environmentToLensHubContract(ethereumNode.environment),
    LENS_HUB_ABI,
    ethereumProvider(ethereumNode)
  ) as unknown as LensHub;

  return (_lensHubCached[ethereumNode.environment] = contract);
};

export const DAlensHubInterface = new Interface(LENS_HUB_ABI);

export const getPubCount = async (
  profileId: string,
  blockNumber: number,
  ethereumNode: EthereumNode
): Promise<BigNumber> => {
  return getLensHubContract(ethereumNode).getPubCount(profileId, {
    blockTag: blockNumber,
  });
};
