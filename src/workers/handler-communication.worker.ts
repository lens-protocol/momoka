import { parentPort } from 'worker_threads';
import { DAPublicationWithTimestampProofsBatchResult } from '../data-availability-models/data-availability-timestamp-proofs';
import { ProofResult } from '../proofs/check-da-proofs-batch';
import { CheckDASubmissionOptions } from '../proofs/models/check-da-submisson-options';
import { checkDAProofsBatchWorker } from './message-handlers/check-da-proofs-batch.worker';
import { checkDAProofsWithMetadataBatchWorker } from './message-handlers/check-da-proofs-with-metadata-batch.worker';

export type CheckDAProofsBatchWorkerRequest = HandlerWorkerRequest<
  HandlerWorkers.CHECK_DA_PROOFS_BATCH,
  string[]
>;

export interface CheckDAProofsWihMetadataBatchWorkerRequest {
  txId: string;
  daPublicationWithTimestampProofs: DAPublicationWithTimestampProofsBatchResult;
  options: CheckDASubmissionOptions;
}

export type CheckDAProofsWithMetadataBatchWorkerRequest = HandlerWorkerRequest<
  HandlerWorkers.CHECK_DA_PROOFS_WITH_METADATA_BATCH,
  CheckDAProofsWihMetadataBatchWorkerRequest[]
>;

export enum HandlerWorkers {
  CHECK_DA_PROOFS_BATCH = 'CHECK_DA_PROOFS_BATCH',
  CHECK_DA_PROOFS_WITH_METADATA_BATCH = 'CHECK_DA_PROOFS_WITH_METADATA_BATCH',
}

export interface HandlerWorkerRequest<THandlerWorkers extends HandlerWorkers, T> {
  worker: THandlerWorkers;
  data: T;
}

export type HandlerWorkerData =
  | CheckDAProofsBatchWorkerRequest
  | CheckDAProofsWithMetadataBatchWorkerRequest;

const executeWorker = async (request: HandlerWorkerData): Promise<ProofResult[] | boolean[]> => {
  switch (request.worker) {
    case HandlerWorkers.CHECK_DA_PROOFS_BATCH:
      return await checkDAProofsBatchWorker(request.data as string[]);
    case HandlerWorkers.CHECK_DA_PROOFS_WITH_METADATA_BATCH:
      return await checkDAProofsWithMetadataBatchWorker(
        request.data.map((r) => {
          return {
            txId: r.txId,
            daPublicationWithTimestampProofs: r.daPublicationWithTimestampProofs,
            options: {
              ...r.options,
              // eslint-disable-next-line @typescript-eslint/no-empty-function
              log: () => {},
            },
          };
        })
      );
  }
};

// eslint-disable-next-line require-await
parentPort?.on('message', async (request: string) => {
  const handlerWorkerData = JSON.parse(request) as HandlerWorkerData;
  const result = await executeWorker(handlerWorkerData);

  parentPort!.postMessage(result);
});
