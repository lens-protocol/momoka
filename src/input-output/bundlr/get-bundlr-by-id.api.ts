import { retryWithTimeout } from '../../common/helpers';
import { TimeoutError, TIMEOUT_ERROR } from '../common';
import { FetchProvider, fetchWithTimeout } from '../fetch-with-timeout';
import { BUNDLR_GATEWAY_TX } from './bundlr-config';

/**
 * Sends a GET request to the Lens Bundlr API to retrieve data associated with a given transaction ID.
 * @param txId The transaction ID to retrieve data for.
 * @param options The options for the request.
 * @returns The data associated with the given transaction ID, or `null` if the transaction cannot be found, or `TimeoutError` if the request times out.
 */
export const getBundlrByIdAPI = <T>(
  txId: string,
  { provider }: { provider: FetchProvider }
): Promise<T | TimeoutError | null> => {
  return retryWithTimeout(
    async () => {
      try {
        return await fetchWithTimeout<T>(`${BUNDLR_GATEWAY_TX}${txId}/data`, { provider });
      } catch (error) {
        return TIMEOUT_ERROR;
      }
    },
    { maxRetries: 3, delayMs: 200 }
  );
};
