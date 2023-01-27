import fetch from 'node-fetch-commonjs';

export const getBundlrByIdAPI = async <T>(txId: string): Promise<T> => {
  const metadata = await fetch(`https://gateway.bundlr.network/tx/${txId}/data`);

  const result: T = (await metadata.json()) as T;

  return result;
};
