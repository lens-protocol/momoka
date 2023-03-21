import { DAProofsVerifier } from './check-da-proof';
import { workerPool } from '../workers/worker-pool';
import { HandlerWorkers } from '../workers/handler-communication.worker';
import { deepClone } from '../common/helpers';
import {
  DAEventType,
  DAStructurePublication,
  PublicationTypedData,
} from '../data-availability-models/publications/data-availability-structure-publication';

export class ThreadedVerifier implements DAProofsVerifier {
  extractAddress(
    daPublication: DAStructurePublication<DAEventType, PublicationTypedData>
  ): Promise<string> {
    const signature = deepClone(daPublication.signature);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // TODO: Is that important to remove signature from the shared object?
    delete daPublication.signature;

    return workerPool.execute<string>({
      worker: HandlerWorkers.EVM_VERIFY_MESSAGE,
      data: {
        daPublication,
        signature,
      },
    });
  }

  verifyTimestampSignature(
    daPublication: DAStructurePublication<DAEventType, PublicationTypedData>
  ): Promise<boolean> {
    return workerPool.execute<boolean>({
      worker: HandlerWorkers.BUNDLR_VERIFY_RECEIPT,
      data: {
        bundlrUploadResponse: daPublication.timestampProofs.response,
      },
    });
  }
}
