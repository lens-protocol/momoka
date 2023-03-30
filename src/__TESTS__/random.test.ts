import { getArweaveByIdAPI } from '../input-output/arweave/get-arweave-by-id.api';

describe('random', () => {
  it('getArweaveByIdAPI', async () => {
    const txId = 'oWnpbkMpnGxMMnFDxnwxCQVhEK55jJeuiyLGUv2bSrk';
    await getArweaveByIdAPI(txId);
  });

  // TODO: Fix this test
  // it('getBundlrByIdAPI', async () => {
  //   const txId = 'oWnpbkMpnGxMMnFDxnwxCQVhEK55jJeuiyLGUv2bSrk';
  //   await getBundlrByIdAPI(txId);
  // });
});
