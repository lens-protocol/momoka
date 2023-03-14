import { postWithTimeout, TimeoutError, TIMEOUT_ERROR } from '../fetch-with-timeout';
import { sleep } from '../helpers';
import { BUNDLR_NODE } from './bundlr-config';

export interface BundlrBulkTxSuccess {
  id: string;
  address: string;
  data: string;
}

export interface BundlrBulkTxsResponse {
  success: BundlrBulkTxSuccess[];
  failed: Record<string, string>;
}

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
  } catch (_error) {
    console.log('_error', _error);
    if (attempts > 3) {
      console.log('BUNDLR TIMEOUTS', _error);
      return TIMEOUT_ERROR;
    }

    // sleep for 100ms and try again
    await sleep(100);
    return await getBundlrBulkTxsAPI(txIds, attempts + 1);
  }
};
