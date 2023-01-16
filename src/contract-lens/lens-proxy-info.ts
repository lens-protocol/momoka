import { BigNumber, ethers } from 'ethers';
import { Interface } from 'ethers/lib/utils';
import { ethereumProvider } from '../ethereum';
import { LensHub } from '../ethereum-abi-types/LensHub';
import { LENS_HUB_ABI } from './lens-hub-contract-abi';

export const LENS_PROXY_MUMBAI_CONTRACT = '0x60Ae865ee4C725cd04353b5AAb364553f56ceF82';

let _lensHubCached: LensHub | undefined = undefined;

export const getLensHubContract = (): LensHub => {
  if (_lensHubCached) {
    return _lensHubCached;
  }

  const contract = new ethers.Contract(
    LENS_PROXY_MUMBAI_CONTRACT,
    LENS_HUB_ABI,
    ethereumProvider
  ) as unknown as LensHub;

  return (_lensHubCached = contract);
};

export const DAlensHubInterface = new Interface(LENS_HUB_ABI);

export const getPubCount = async (profileId: string, blockNumber: number): Promise<BigNumber> => {
  return getLensHubContract().getPubCount(profileId, {
    blockTag: blockNumber,
  });
};
