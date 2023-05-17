import { getBundlrByIdAPI } from '../input-output/bundlr/get-bundlr-by-id.api';
import { LibCurlProvider } from '../input-output/lib-curl-provider';

describe('random', () => {
  it('getBundlrByIdAPI', async () => {
    const txId = 'oWnpbkMpnGxMMnFDxnwxCQVhEK55jJeuiyLGUv2bSrk';
    await getBundlrByIdAPI(txId, { provider: new LibCurlProvider() });
  });
});
