import fetch from 'node-fetch-commonjs';

export const getArweaveByIdAPI = async <T>(arweaveId: string) => {
  const metadata = await fetch(`https://arweave.net/${arweaveId}`);

  const result: T = (await metadata.json()) as T;

  return result;
};
