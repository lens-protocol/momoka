import { getArweaveByIdAPI } from '../arweave/get-arweave-by-id.api';
import { getBundlrByIdAPI } from '../bundlr/get-bundlr-by-id.api';

describe('random', () => {
  it('getArweaveByIdAPI', async () => {
    const txId = 'oWnpbkMpnGxMMnFDxnwxCQVhEK55jJeuiyLGUv2bSrk';
    await getArweaveByIdAPI(txId);
  });

  it('getBundlrByIdAPI', async () => {
    const txId = 'oWnpbkMpnGxMMnFDxnwxCQVhEK55jJeuiyLGUv2bSrk';
    await getBundlrByIdAPI(txId);
  });
});
