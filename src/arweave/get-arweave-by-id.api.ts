import { getBundlrByIdAPI } from '../bundlr/get-bundlr-by-id.api';
import { TimeoutError } from '../fetch-with-timeout';

export const getArweaveByIdAPI = async <T>(txId: string): Promise<T | TimeoutError | null> => {
  // try {
  //   const metadata = await fetchWithTimeout(`https://arweave.net/${txId}`);

  //   const result: T = (await metadata.json()) as T;

  //   return result;
  // } catch (_error) {
  //   console.error('Could not fetch from arweave gateway, falling back to bundlr gateway', _error);
  //   // fall back to bundlr gateway
  //   return await getBundlrByIdAPI(txId);
  // }

  // bundlr can handle much more load, you can use the above if you wish to use arweave gateway!
  return await getBundlrByIdAPI(txId);
};
