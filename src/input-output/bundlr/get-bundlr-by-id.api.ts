import { retryWithTimeout } from '../../common/helpers';
import { TimeoutError, TIMEOUT_ERROR } from '../common';
import { fetchWithTimeout } from '../fetch-with-timeout';
import { BUNDLR_GATEWAY_TX } from './bundlr-config';

/**
 * Sends a GET request to the Lens Bundlr API to retrieve data associated with a given transaction ID.
 * @param txId The transaction ID to retrieve data for.
 * @returns The data associated with the given transaction ID, or `null` if the transaction cannot be found, or `TimeoutError` if the request times out.
 */
export const getBundlrByIdAPI = <T>(txId: string): Promise<T | TimeoutError | null> => {
  return retryWithTimeout(
    async () => {
      try {
        return await fetchWithTimeout<T>(`${BUNDLR_GATEWAY_TX}${txId}/data`);
      } catch (error) {
        console.log(error);
        return TIMEOUT_ERROR;
      }
    },
    { maxRetries: 3, delayMs: 200 }
  );
};
