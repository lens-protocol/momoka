/**
 * Enum defining the supported Ethereum environments for the verifier node.
 */
export enum Environment {
  POLYGON = 'POLYGON',
  MUMBAI = 'MUMBAI',
  SANDBOX = 'SANDBOX',
}

/**
 * Enum defining the deployment configurations for the verifier node.
 */
export enum Deployment {
  PRODUCTION = 'PRODUCTION',
  STAGING = 'STAGING',
  LOCAL = 'LOCAL',
}

/**
 * Maps an Ethereum environment to its corresponding chain ID.
 * @param environment The Ethereum environment to map to a chain ID.
 * @returns The chain ID corresponding to the provided Ethereum environment.
 * @throws An error if the provided environment is invalid.
 */
export const environmentToChainId = (environment: Environment): 137 | 80001 => {
  switch (environment) {
    case Environment.POLYGON:
      return 137;
    case Environment.MUMBAI:
    case Environment.SANDBOX:
      return 80001;
    default:
      throw new Error('Invalid environment');
  }
};

/**
 * Maps an Ethereum environment to its corresponding Lens Hub contract address.
 * @param environment The Ethereum environment to map to a Lens Hub contract address.
 * @returns The Lens Hub contract address corresponding to the provided Ethereum environment.
 * @throws An error if the provided environment is invalid.
 */
export const environmentToLensHubContract = (environment: Environment): string => {
  switch (environment) {
    case Environment.POLYGON:
      return '0xDb46d1Dc155634FbC732f92E853b10B288AD5a1d';
    case Environment.MUMBAI:
      return '0x60Ae865ee4C725cd04353b5AAb364553f56ceF82';
    case Environment.SANDBOX:
      return '0x7582177F9E536aB0b6c721e11f383C326F2Ad1D5';
    default:
      throw new Error('Invalid environment');
  }
};
