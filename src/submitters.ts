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
        throw new Error('Not implemented yet');
      case Environment.MUMBAI:
        return ['0xEE3E8f53df70C3A3eeDA2076CDCa17c451aa8F96'.toLowerCase()];
      case Environment.SANDBOX:
        throw new Error('Not implemented yet');
      default:
        throw new Error('Invalid environment');
    }
  }

  if (deployment === Deployment.STAGING) {
    switch (environment) {
      case Environment.POLYGON:
        throw new Error('Not implemented yet');
      case Environment.MUMBAI:
        return ['0x886Bb211aC324dAF3744b2AB0eF20C0aCf73eA59'.toLowerCase()];
      case Environment.SANDBOX:
        throw new Error('Not implemented yet');
      default:
        throw new Error('Invalid environment');
    }
  }

  if (deployment === Deployment.LOCAL) {
    switch (environment) {
      case Environment.POLYGON:
        throw new Error('Not implemented yet');
      case Environment.MUMBAI:
        return ['0x8Fc176aA6FC843D3422f0C1832f1b9E17be00C1c'.toLowerCase()];
      case Environment.SANDBOX:
        throw new Error('Not implemented yet');
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
