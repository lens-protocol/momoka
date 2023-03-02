import { getBundlrByIdAPI } from '../bundlr/get-bundlr-by-id.api';
import { fetchWithTimeout, TimeoutError } from '../fetch-with-timeout';

export const getArweaveByIdAPI = async <T>(txId: string): Promise<T | TimeoutError> => {
  try {
    const metadata = await fetchWithTimeout(`https://arweave.net/${txId}`);

    const result: T = (await metadata.json()) as T;

    return result;
  } catch (_error) {
    // fall back to bundlr gateway
    return await getBundlrByIdAPI(txId);
  }
};
