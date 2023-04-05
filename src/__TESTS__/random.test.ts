import { getArweaveByIdAPI } from '../input-output/arweave/get-arweave-by-id.api';
import { getBundlrByIdAPI } from '../input-output/bundlr/get-bundlr-by-id.api';
import { LibCurlProvider } from '../input-output/lib-curl-provider';

describe('random', () => {
  it('getArweaveByIdAPI', async () => {
    const txId = 'oWnpbkMpnGxMMnFDxnwxCQVhEK55jJeuiyLGUv2bSrk';
    await getArweaveByIdAPI(txId);
  });

  it('getBundlrByIdAPI', async () => {
    const txId = 'oWnpbkMpnGxMMnFDxnwxCQVhEK55jJeuiyLGUv2bSrk';
    await getBundlrByIdAPI(txId, { provider: new LibCurlProvider() });
  });
});
