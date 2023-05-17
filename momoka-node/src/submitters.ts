import { Deployment, Environment } from './common/environment';

/**
 * Returns the list of submitters based on the given environment and deployment
 * @param environment - The environment to get the submitters for
 * @param deployment - The deployment to get the submitters for. Defaults to Deployment.PRODUCTION
 * @returns An array of submitter addresses in lowercase
 */
export const getSubmitters = (
  environment: Environment,
  deployment: Deployment = Deployment.PRODUCTION
): string[] => {
  // this will come from a smart contract later on!

  if (deployment === Deployment.PRODUCTION) {
    switch (environment) {
      case Environment.POLYGON:
        return ['0xBe29464B9784a0d8956f29630d8bc4D7B5737435'.toLowerCase()];
      case Environment.MUMBAI:
        return ['0xEE3E8f53df70C3A3eeDA2076CDCa17c451aa8F96'.toLowerCase()];
      case Environment.SANDBOX:
        throw new Error('Not Supported');
      default:
        throw new Error('Invalid environment');
    }
  }

  if (deployment === Deployment.STAGING) {
    switch (environment) {
      case Environment.POLYGON:
        throw new Error('Not Supported');
      case Environment.MUMBAI:
        return ['0x122938FE0d1fC6e00EF1b814cD7e44677e99b4f7'.toLowerCase()];
      case Environment.SANDBOX:
        throw new Error('Not Supported');
      default:
        throw new Error('Invalid environment');
    }
  }

  if (deployment === Deployment.LOCAL) {
    switch (environment) {
      case Environment.POLYGON:
        throw new Error('Not Supported');
      case Environment.MUMBAI:
        return ['0x8Fc176aA6FC843D3422f0C1832f1b9E17be00C1c'.toLowerCase()];
      case Environment.SANDBOX:
        throw new Error('Not Supported');
      default:
        throw new Error('Invalid environment');
    }
  }

  throw new Error('Invalid deployment');
};

/**
 * Checks if an Ethereum address is a valid submitter for the given environment and deployment.
 * @param environment The environment (Polygon, Mumbai, or Sandbox).
 * @param address The Ethereum address to check.
 * @param deployment The deployment (Production, Staging, or Local). Defaults to Production.
 * @returns True if the address is a valid submitter, false otherwise.
 */
export const isValidSubmitter = (
  environment: Environment,
  address: string,
  deployment?: Deployment
): boolean => {
  return getSubmitters(environment, deployment).includes(address.toLowerCase());
};
