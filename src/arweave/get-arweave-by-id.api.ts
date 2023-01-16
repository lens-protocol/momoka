import fetch from 'node-fetch-commonjs';

export const getArweaveByIdAPI = async <T>(arweaveId: string) => {
  const metadata = await fetch(`https://arweave.net/${arweaveId}`);
  // console.log(`${arweaveId} - result`, metadata);

  const result: T = (await metadata.json()) as T;
  // console.log(`${arweaveId} - result`, result);

  return result;
};
