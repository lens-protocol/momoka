import Utils from '@bundlr-network/client/build/common/utils';
import { BundlrUploadResponse } from '../../data-availability-models/data-availability-timestamp-proofs';

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
  return Utils.verifyReceipt(request.bundlrUploadResponse as any);
};
