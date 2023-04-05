import { Environment } from '../common/environment';
import { getParamOrExit } from '../common/helpers';
import { EthereumNode } from '../evm/ethereum';
import { getOwnerOfTransactionAPI } from '../input-output/bundlr/get-owner-of-transaction.api';

import { getSubmitters, isValidSubmitter } from '../submitters';

jest.mock('../input-output/bundlr/get-owner-of-transaction.api');

export const mockGetOwnerOfTransactionAPI = getOwnerOfTransactionAPI as jest.MockedFunction<
  typeof getOwnerOfTransactionAPI
>;

const ethereumNode: EthereumNode = {
  environment: getParamOrExit('ETHEREUM_NETWORK') as Environment,
  nodeUrl: getParamOrExit('NODE_URL'),
};

describe('submitters', () => {
  describe('getSubmitters', () => {
    it('should return 1 submitter', () => {
      expect(getSubmitters(ethereumNode.environment)).toHaveLength(1);
    });
  });

  describe('isValidSubmitter', () => {
    it('should return false with an invalid submitter', () => {
      expect(isValidSubmitter(ethereumNode.environment, '111')).toEqual(false);
    });

    it('should return true with an valid submitter', () => {
      const submitter = getSubmitters(ethereumNode.environment)[0];
      expect(isValidSubmitter(ethereumNode.environment, submitter)).toEqual(true);
    });
  });
});
