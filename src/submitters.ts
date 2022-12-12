import { getOwnerOfTransactionsAPI } from './bundlr/get-owner-of-transaction.api';

export const getSubmitters = () => {
  // this will come from a smart contract!
  return ['0x82478df5a281a486070c11ebf808d3dd874fda86'];
};

export const isValidSubmitter = (address: string) => {
  return getSubmitters().includes(address);
};

export const isValidTransactionSubmitter = async (arweaveId: string) => {
  const owner = await getOwnerOfTransactionsAPI([arweaveId]);
  const result = owner[0];
  if (!result.address) {
    return false;
  }

  return isValidSubmitter(result.address);
};
