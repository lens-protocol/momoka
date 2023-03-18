import { sleep } from '../../common/helpers';
import { TimeoutError, TIMEOUT_ERROR } from '../common';
import { fetchWithTimeout } from '../fetch-with-timeout';
import { BUNDLR_NODE_TX } from './bundlr-config';

/**
 * Information about a Lens Bundlr transaction.
 */
interface BundlrTx {
  id: string;
  currency: string;
  address: string;
  owner: string;
  signature: string;
  target: string;
  tags: {
    name: string;
    value: string;
  }[];
  anchor: string;
  data_size: number;
}

/**
 * Sends a GET request to the Lens Bundlr API to retrieve the owner of a given transaction.
 * @param txId The ID of the transaction to retrieve the owner for.
 * @param attempts The number of times the function has attempted to retrieve the transaction owner (used internally for retrying failed requests).
 * @returns The owner of the transaction with the given ID, or `null` if the transaction cannot be found, or `TimeoutError` if the request times out.
 */
export const getOwnerOfTransactionAPI = async (
  txId: string,
  attempts = 0
): Promise<string | null | TimeoutError> => {
  try {
    const result = await fetchWithTimeout<BundlrTx>(`${BUNDLR_NODE_TX}${txId}`);

    return result.address;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (attempts >= 3) {
      if (error.name === 'AbortError') {
        return TIMEOUT_ERROR;
      }
      return null;
    }

    await sleep(300);
    return await getOwnerOfTransactionAPI(txId, attempts + 1);
  }
};
