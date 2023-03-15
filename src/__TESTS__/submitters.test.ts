import { Environment } from '../common/environment';
import { getParamOrExit } from '../common/helpers';
import { EthereumNode } from '../evm/ethereum';
import * as apiCall from '../input-output/bundlr/get-owner-of-transaction.api';

import { getSubmitters, isValidSubmitter, isValidTransactionSubmitter } from '../submitters';

jest.mock('../bundlr/get-owner-of-transaction.api');

export const mockGetOwnerOfTransactionAPI = apiCall.getOwnerOfTransactionAPI as jest.MockedFunction<
  typeof apiCall.getOwnerOfTransactionAPI
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

  describe('isValidTransactionSubmitter', () => {
    it('should return false with an invalid submitter', async () => {
      mockGetOwnerOfTransactionAPI.mockImplementation(() => Promise.resolve('111'));
      expect(await isValidTransactionSubmitter(ethereumNode.environment, '111', jest.fn())).toEqual(
        false
      );
    });

    it('should return false with an null submitter', async () => {
      mockGetOwnerOfTransactionAPI.mockImplementation(() => Promise.resolve(null));
      expect(await isValidTransactionSubmitter(ethereumNode.environment, '111', jest.fn())).toEqual(
        false
      );
    });

    it('should return true with an valid submitter', async () => {
      const submitter = getSubmitters(ethereumNode.environment)[0];
      mockGetOwnerOfTransactionAPI.mockImplementation(() => Promise.resolve(submitter));
      expect(
        await isValidTransactionSubmitter(ethereumNode.environment, submitter, jest.fn())
      ).toEqual(true);
    });
  });
});
