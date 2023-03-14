import { fetchWithTimeout, TimeoutError, TIMEOUT_ERROR } from '../fetch-with-timeout';
import { sleep } from '../helpers';
import { BUNDLR_NODE_TX } from './bundlr-config';

interface BundlrTag {
  name: string;
  value: string;
}

interface BundlrTx {
  id: string;
  currency: string;
  address: string;
  owner: string;
  signature: string;
  target: string;
  tags: BundlrTag[];
  anchor: string;
  data_size: number;
}

export const getOwnerOfTransactionAPI = async (
  txId: string,
  attempts = 0
): Promise<string | null | TimeoutError> => {
  try {
    const result = await fetchWithTimeout<BundlrTx>(`${BUNDLR_NODE_TX}${txId}`);

    return result.address;
  } catch (error: any) {
    if (attempts > 3) {
      if (error.name == 'AbortError') {
        return TIMEOUT_ERROR;
      }
      return null;
    }

    // sleep for 300ms and try again
    await sleep(300);
    return await getOwnerOfTransactionAPI(txId, attempts + 1);
  }
};
