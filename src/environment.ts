export enum Environment {
  POLYGON = 'POLYGON',
  MUMBAI = 'MUMBAI',
  SANDBOX = 'SANDBOX',
}

export const environmentToChainId = (environment: Environment) => {
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

export const environmentToLensHubContract = (environment: Environment) => {
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
