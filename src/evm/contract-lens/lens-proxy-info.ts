import { BigNumber, ethers } from 'ethers';
import { Interface } from 'ethers/lib/utils';
import { environmentToLensHubContract } from '../../common/environment';
import { LensHub } from '../abi-types/LensHub';
import { EthereumNode, ethereumProvider } from '../ethereum';
import { LENS_HUB_ABI } from './lens-hub-contract-abi';

/**
 * Cached Lens Hub smart contract instances.
 */
const _lensHubCached: {
  POLYGON: LensHub | undefined;
  MUMBAI: LensHub | undefined;
  SANDBOX: LensHub | undefined;
} = {
  POLYGON: undefined,
  MUMBAI: undefined,
  SANDBOX: undefined,
};

/**
 * Returns an instance of the Lens Hub smart contract for the specified Ethereum node.
 * @param ethereumNode The Ethereum node to connect to.
 * @returns An instance of the Lens Hub smart contract.
 */
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
export const getPubCount = async (
  profileId: string,
  blockNumber: number,
  ethereumNode: EthereumNode
): Promise<BigNumber> => {
  return getLensHubContract(ethereumNode).getPubCount(profileId, {
    blockTag: blockNumber,
  });
};
