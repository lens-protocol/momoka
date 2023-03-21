import deepHash from 'arweave/node/lib/deepHash';
import Arweave from 'arweave/node';
import { b64UrlToBuffer } from 'arweave/node/lib/utils';

import { BundlrUploadResponse } from '../../data-availability-models/data-availability-timestamp-proofs';

// not using "@bundlr-network/client" because we have to maintain 2 verions anyway
const verifyReceipt = async ({
  deadlineHeight,
  id,
  public: pubKey,
  signature,
  timestamp,
  version,
}: BundlrUploadResponse): Promise<boolean> => {
  const dh = await deepHash([
    Arweave.utils.stringToBuffer('Bundlr'),
    Arweave.utils.stringToBuffer(version),
    Arweave.utils.stringToBuffer(id),
    Arweave.utils.stringToBuffer(deadlineHeight.toString()),
    Arweave.utils.stringToBuffer(timestamp.toString()),
  ]);
  return await Arweave.crypto.verify(pubKey, dh, b64UrlToBuffer(signature));
};

export interface BundlrVerifyReceiptWorkerRequest {
  bundlrUploadResponse: BundlrUploadResponse;
}

/**
 *  Verifies the receipt of a Bundlr upload
 * @param request - The request to verify the receipt of a Bundlr upload
 */
export const bundlrVerifyReceiptWorker = (
  request: BundlrVerifyReceiptWorkerRequest
): Promise<boolean> => {
  // bundlr typings are Required<Proofs> but they are sharing the response and request
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return verifyReceipt(request.bundlrUploadResponse);
};
