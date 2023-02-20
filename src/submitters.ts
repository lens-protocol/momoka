import { getOwnerOfTransactionAPI } from './bundlr/get-owner-of-transaction.api';
import { Environment } from './environment';

export const getSubmitters = (environment: Environment) => {
  // this will come from a smart contract later on!

  switch (environment) {
    case Environment.POLYGON:
      throw new Error('Not implemented yet');
    case Environment.MUMBAI:
      return ['0x82478df5a281a486070c11ebf808d3dd874fda86'.toLowerCase()];
    case Environment.SANDBOX:
      throw new Error('Not implemented yet');
    default:
      throw new Error('Invalid environment');
  }
};

export const isValidSubmitter = (environment: Environment, address: string) => {
  return getSubmitters(environment).includes(address.toLowerCase());
};

export const isValidTransactionSubmitter = async (
  environment: Environment,
  arweaveId: string,
  log: (message: string, ...optionalParams: any[]) => void
) => {
  const owner = await getOwnerOfTransactionAPI(arweaveId);
  log('owner result', owner);
  if (!owner) {
    return false;
  }

  return isValidSubmitter(environment, owner);
};
