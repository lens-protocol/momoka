import { TimeoutError, TIMEOUT_ERROR } from '../fetch-with-timeout';
import { sleep } from '../helpers';

export const getBundlrByIdAPI = async <T>(
  txId: string,
  attempts = 0
): Promise<T | TimeoutError> => {
  try {
    const metadata = await fetch(`https://gateway.bundlr.network/tx/${txId}/data`);

    const result: T = (await metadata.json()) as T;

    return result;
  } catch (_error) {
    if (attempts > 3) {
      return TIMEOUT_ERROR;
    }

    // sleep for 300ms and try again
    sleep(300);
    return await getBundlrByIdAPI(txId, attempts + 1);
  }
};
