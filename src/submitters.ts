import { getOwnerOfTransactionAPI } from './bundlr/get-owner-of-transaction.api';
import { Deployment, Environment } from './environment';
import { TimeoutError, TIMEOUT_ERROR } from './fetch-with-timeout';

export const getSubmitters = (
  environment: Environment,
  deployment: Deployment = Deployment.PRODUCTION
) => {
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

export const isValidSubmitter = (
  environment: Environment,
  address: string,
  deployment?: Deployment
) => {
  return getSubmitters(environment, deployment).includes(address.toLowerCase());
};

export const isValidTransactionSubmitter = async (
  environment: Environment,
  arweaveId: string,
  log: (message: string, ...optionalParams: any[]) => void,
  deployment?: Deployment
): Promise<boolean | TimeoutError> => {
  const owner = await getOwnerOfTransactionAPI(arweaveId);
  if (owner === TIMEOUT_ERROR) {
    return TIMEOUT_ERROR;
  }

  log('owner result', owner);
  if (!owner) {
    return false;
  }

  return isValidSubmitter(environment, owner, deployment);
};
