import fetch from 'node-fetch-commonjs';
import { getBundlrByIdAPI } from '../bundlr/get-bundlr-by-id.api';

export const getArweaveByIdAPI = async <T>(txId: string): Promise<T> => {
  try {
    const metadata = await fetch(`https://arweave.net/${txId}`);

    const result: T = (await metadata.json()) as T;

    return result;
  } catch (_error) {
    // fall back to bundlr gateway
    return await getBundlrByIdAPI(txId);
  }
};
