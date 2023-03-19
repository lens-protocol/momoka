import { retryWithTimeout } from '../../common/helpers';
import { TimeoutError, TIMEOUT_ERROR } from '../common';
import { postWithTimeout } from '../post-with-timeout';
import { BUNDLR_NODE } from './bundlr-config';

/**
 * The response format for the `getBundlrBulkTxsAPI` function when it is successful.
 */
export interface BundlrBulkTxSuccess {
  id: string;
  address: string;
  data: string;
}

/**
 * The response format for the `getBundlrBulkTxsAPI` function.
 */
export interface BundlrBulkTxsResponse {
  success: BundlrBulkTxSuccess[];
  failed: Record<string, string>;
}

/**
 * Sends a POST request to the Lens Bundlr API to retrieve data associated with multiple transaction IDs.
 * @param txIds The transaction IDs to retrieve data for.
 * @returns The data associated with the given transaction IDs, or `TimeoutError` if the request times out.
 */
export const getBundlrBulkTxsAPI = (
  txIds: string[]
): Promise<BundlrBulkTxsResponse | TimeoutError> => {
  return retryWithTimeout(
    async () => {
      try {
        return await postWithTimeout<BundlrBulkTxsResponse, string[]>(
          `${BUNDLR_NODE}bulk/txs/data`,
          txIds
        );
      } catch (error) {
        return TIMEOUT_ERROR;
      }
    },
    { maxRetries: 3, delayMs: 200 }
  );
};
