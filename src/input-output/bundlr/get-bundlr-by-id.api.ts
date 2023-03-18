import { sleep } from '../../common/helpers';
import { TimeoutError, TIMEOUT_ERROR } from '../common';
import { fetchWithTimeout } from '../fetch-with-timeout';
import { BUNDLR_GATEWAY_TX } from './bundlr-config';

/**
 * Sends a GET request to the Lens Bundlr API to retrieve data associated with a given transaction ID.
 * @param txId The transaction ID to retrieve data for.
 * @param attempts The number of times the function has attempted to retrieve data for the given transaction ID (used internally for retrying failed requests).
 * @returns The data associated with the given transaction ID, or `null` if the transaction cannot be found, or `TimeoutError` if the request times out.
 */
export const getBundlrByIdAPI = async <T>(
  txId: string,
  attempts = 0
): Promise<T | TimeoutError | null> => {
  try {
    const response = await fetchWithTimeout<T>(`${BUNDLR_GATEWAY_TX}${txId}/data`);

    return response;
  } catch (error) {
    if (attempts >= 3) {
      console.log('BUNDLR TIMEOUTS', error);
      return TIMEOUT_ERROR;
    }

    await sleep(200);
    return await getBundlrByIdAPI(txId, attempts + 1);
  }
};
