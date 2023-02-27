import * as apiCall from '../bundlr/get-owner-of-transaction.api';
import { Environment } from '../environment';
import { EthereumNode } from '../ethereum';
import { getParamOrExit } from '../helpers';
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
      expect(getSubmitters(ethereumNode.environment, false)).toHaveLength(1);
    });
  });

  describe('isValidSubmitter', () => {
    it('should return false with an invalid submitter', () => {
      expect(isValidSubmitter(ethereumNode.environment, '111', false)).toEqual(false);
    });

    it('should return true with an valid submitter', () => {
      const submitter = getSubmitters(ethereumNode.environment, false)[0];
      expect(isValidSubmitter(ethereumNode.environment, submitter, false)).toEqual(true);
    });
  });

  describe('isValidTransactionSubmitter', () => {
    it('should return false with an invalid submitter', async () => {
      mockGetOwnerOfTransactionAPI.mockImplementation(async () => '111');
      expect(
        await isValidTransactionSubmitter(ethereumNode.environment, '111', jest.fn(), false)
      ).toEqual(false);
    });

    it('should return false with an null submitter', async () => {
      mockGetOwnerOfTransactionAPI.mockImplementation(async () => null);
      expect(
        await isValidTransactionSubmitter(ethereumNode.environment, '111', jest.fn(), false)
      ).toEqual(false);
    });

    it('should return true with an valid submitter', async () => {
      const submitter = getSubmitters(ethereumNode.environment, false)[0];
      mockGetOwnerOfTransactionAPI.mockImplementation(async () => submitter);
      expect(
        await isValidTransactionSubmitter(ethereumNode.environment, submitter, jest.fn(), false)
      ).toEqual(true);
    });
  });
});
