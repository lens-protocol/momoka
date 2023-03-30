import { retryWithTimeout } from '../../common/helpers';
import { TimeoutError } from '../common';
import { FetchProvider, fetchWithTimeout } from '../fetch-with-timeout';
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
 * @param options The options to use when sending the request.
 * @returns The owner of the transaction with the given ID, or `null` if the transaction cannot be found, or `TimeoutError` if the request times out.
 */
export const getOwnerOfTransactionAPI = (
  txId: string,
  { provider }: { provider: FetchProvider }
): Promise<string | null | TimeoutError> => {
  return retryWithTimeout(async () => {
    const result = await fetchWithTimeout<BundlrTx>(`${BUNDLR_NODE_TX}${txId}`, {
      provider,
    });
    if (!result) return null;
    return result.address;
  });
};
