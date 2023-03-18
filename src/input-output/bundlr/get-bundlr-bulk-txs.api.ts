import { sleep } from '../../common/helpers';
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
 * @param attempts The number of times the function has attempted to retrieve data for the given transaction IDs (used internally for retrying failed requests).
 * @returns The data associated with the given transaction IDs, or `TimeoutError` if the request times out.
 */
export const getBundlrBulkTxsAPI = async (
  txIds: string[],
  attempts = 0
): Promise<BundlrBulkTxsResponse | TimeoutError> => {
  try {
    const response = await postWithTimeout<BundlrBulkTxsResponse, string[]>(
      `${BUNDLR_NODE}bulk/txs/data`,
      txIds
    );

    return response;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (attempts >= 3) {
      return TIMEOUT_ERROR;
    }

    await sleep(200);
    return await getBundlrBulkTxsAPI(txIds, attempts + 1);
  }
};
