export const getArweaveByIdAPI = async <T>(arweaveId: string) => {
  const metadata = await fetch(`https://arweave.net/${arweaveId}`);

  const result: T = await metadata.json();
  console.log(`${arweaveId} - result`, result);

  return result;
};
