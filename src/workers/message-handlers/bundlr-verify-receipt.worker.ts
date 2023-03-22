import deepHash from 'arweave/node/lib/deepHash';
import Arweave from 'arweave/node';
import { b64UrlToBuffer } from 'arweave/node/lib/utils';

import { BundlrUploadResponse } from '../../data-availability-models/data-availability-timestamp-proofs';
import { verifyReceipt } from '../../proofs/utils';

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
  return verifyReceipt(request.bundlrUploadResponse, {
    crypto: Arweave.crypto,
    deepHash,
    b64UrlToBuffer,
    stringToBuffer: Arweave.utils.stringToBuffer,
  });
};
