import { fetchWithTimeout, TimeoutError, TIMEOUT_ERROR } from '../fetch-with-timeout';
import { sleep } from '../helpers';
import { BUNDLR_GATEWAY_TX } from './bundlr-config';

export const getBundlrByIdAPI = async <T>(
  txId: string,
  attempts = 0
): Promise<T | TimeoutError | null> => {
  try {
    const response = await fetchWithTimeout<T>(`${BUNDLR_GATEWAY_TX}${txId}/data`);

    return response;
  } catch (_error) {
    console.log('_error', _error);
    if (attempts > 3) {
      console.log('BUNDLR TIMEOUTS', _error);
      return TIMEOUT_ERROR;
    }

    // sleep for 300ms and try again
    await sleep(300);
    return await getBundlrByIdAPI(txId, attempts + 1);
  }
};
