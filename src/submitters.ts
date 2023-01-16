import { getOwnerOfTransactionAPI } from './bundlr/get-owner-of-transaction.api';

export const getSubmitters = () => {
  // this will come from a smart contract!
  return ['0x82478df5a281a486070c11ebf808d3dd874fda86'.toLowerCase()];
};

export const isValidSubmitter = (address: string) => {
  return getSubmitters().includes(address.toLowerCase());
};

export const isValidTransactionSubmitter = async (
  arweaveId: string,
  log: (message: string, ...optionalParams: any[]) => void
) => {
  const owner = await getOwnerOfTransactionAPI(arweaveId);
  log('owner result', owner);
  if (!owner) {
    return false;
  }

  return isValidSubmitter(owner);
};
