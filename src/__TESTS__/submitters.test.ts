import * as apiCall from '../bundlr/get-owner-of-transaction.api';
import { getSubmitters, isValidSubmitter, isValidTransactionSubmitter } from '../submitters';

jest.mock('../bundlr/get-owner-of-transaction.api');

export const mockGetOwnerOfTransactionAPI = apiCall.getOwnerOfTransactionAPI as jest.MockedFunction<
  typeof apiCall.getOwnerOfTransactionAPI
>;

describe('submitters', () => {
  describe('getSubmitters', () => {
    it('should return 1 submitter', () => {
      expect(getSubmitters()).toHaveLength(1);
    });
  });

  describe('isValidSubmitter', () => {
    it('should return false with an invalid submitter', () => {
      expect(isValidSubmitter('111')).toEqual(false);
    });

    it('should return true with an valid submitter', () => {
      const submitter = getSubmitters()[0];
      expect(isValidSubmitter(submitter)).toEqual(true);
    });
  });

  describe('isValidTransactionSubmitter', () => {
    it('should return false with an invalid submitter', async () => {
      mockGetOwnerOfTransactionAPI.mockImplementation(async () => '111');
      expect(await isValidTransactionSubmitter('111', jest.fn())).toEqual(false);
    });

    it('should return false with an null submitter', async () => {
      mockGetOwnerOfTransactionAPI.mockImplementation(async () => null);
      expect(await isValidTransactionSubmitter('111', jest.fn())).toEqual(false);
    });

    it('should return true with an valid submitter', async () => {
      const submitter = getSubmitters()[0];
      mockGetOwnerOfTransactionAPI.mockImplementation(async () => submitter);
      expect(await isValidTransactionSubmitter(submitter, jest.fn())).toEqual(true);
    });
  });
});
