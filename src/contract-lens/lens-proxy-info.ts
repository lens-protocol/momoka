import { ethers } from 'ethers';
import { Interface } from 'ethers/lib/utils';
import { ethereumProvider } from '../ethereum';
import { LensHub } from '../ethereum-abi-types/LensHub';
import { LENS_HUB_ABI } from './lens-hub-contract-abi';

export const LENS_PROXY_MUMBAI_CONTRACT = '0x60Ae865ee4C725cd04353b5AAb364553f56ceF82';

export const lensHubContract: LensHub = new ethers.Contract(
  LENS_PROXY_MUMBAI_CONTRACT,
  LENS_HUB_ABI,
  ethereumProvider
) as unknown as LensHub;

export const DAlensHubInterface = new Interface(LENS_HUB_ABI);

export const getPubCount = (profileId: string, blockNumber: number) => {
  return lensHubContract.getPubCount(profileId, {
    blockTag: blockNumber,
  });
};
