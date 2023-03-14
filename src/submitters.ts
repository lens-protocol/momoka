import { Deployment, Environment } from './common/environment';
import { LogFunctionType } from './common/logger';
import { getOwnerOfTransactionAPI } from './input-output/bundlr/get-owner-of-transaction.api';
import { TimeoutError, TIMEOUT_ERROR } from './input-output/common';

/**
 * Returns the list of submitters based on the given environment and deployment
 * @param environment - The environment to get the submitters for
 * @param deployment - The deployment to get the submitters for. Defaults to Deployment.PRODUCTION
 * @returns An array of submitter addresses in lowercase
 * @throws if the environment is invalid or if the deployment is invalid
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
        return ['0x886Bb211aC324dAF3744b2AB0eF20C0aCf73eA59'.toLowerCase()];
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
) => {
  return getSubmitters(environment, deployment).includes(address.toLowerCase());
};

/**
 * Checks if the given Arweave transaction was submitted by a valid submitter for the specified environment.
 * @param environment The environment to check against.
 * @param txId The Arweave transaction ID to check the submitter of.
 * @param log A logging function to use for outputting log messages.
 * @param deployment The deployment to check against.
 * @returns A Promise that resolves to true if the submitter is valid, false if it is not valid, or a TimeoutError if the request timed out.
 */
export const isValidTransactionSubmitter = async (
  environment: Environment,
  txId: string,
  log: LogFunctionType,
  deployment?: Deployment
): Promise<boolean | TimeoutError> => {
  const owner = await getOwnerOfTransactionAPI(txId);
  if (owner === TIMEOUT_ERROR) {
    return TIMEOUT_ERROR;
  }

  log('owner result', owner);
  if (!owner) {
    return false;
  }

  return isValidSubmitter(environment, owner, deployment);
};
