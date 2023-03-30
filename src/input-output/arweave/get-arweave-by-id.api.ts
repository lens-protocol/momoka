import { TimeoutError } from '../common';
import { fetchWithTimeout } from '../fetch-with-timeout';
import { LibCurlProvider } from '../lib-curl-provider';

/**
 * Retrieves data associated with a given transaction ID using the arweave gateway.
 * @param txId The transaction ID to retrieve data for.
 * @param options The options for the request.
 * @returns The data associated with the transaction, or `null` if the transaction cannot be found, or `TimeoutError` if the request times out.
 * @note This function is not used internally on the data availability node as it is too slow. Even so you can use this if you wish on a fork or anything else.
 */
export const getArweaveByIdAPI = <T>(txId: string): Promise<T | TimeoutError | null> => {
  return fetchWithTimeout<T>(`https://arweave.net/${txId}`, { provider: new LibCurlProvider() });
};
