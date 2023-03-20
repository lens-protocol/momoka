import {
  bundlrVerifyReceiptWorker,
  BundlrVerifyReceiptWorkerRequest,
  evmVerifyMessageWorker,
  EVMVerifyMessageWorkerRequest,
} from './message-handlers';

export type EVMVerifyMessageHandlerWorkerRequest = HandlerWorkerRequest<
  HandlerWorkers.EVM_VERIFY_MESSAGE,
  EVMVerifyMessageWorkerRequest
>;

export type BundlrVerifyReceiptHandlerWorkerRequest = HandlerWorkerRequest<
  HandlerWorkers.BUNDLR_VERIFY_RECEIPT,
  BundlrVerifyReceiptWorkerRequest
>;

export enum HandlerWorkers {
  EVM_VERIFY_MESSAGE = 'EVM_VERIFY_MESSAGE',
  BUNDLR_VERIFY_RECEIPT = 'BUNDLR_VERIFY_RECEIPT',
}

export interface HandlerWorkerRequest<THandlerWorkers extends HandlerWorkers, T> {
  worker: THandlerWorkers;
  data: T;
}

export type HandlerWorkerData =
  | EVMVerifyMessageHandlerWorkerRequest
  | BundlrVerifyReceiptHandlerWorkerRequest;

const executeWorker = async (request: HandlerWorkerData): Promise<string | boolean> => {
  switch (request.worker) {
    case HandlerWorkers.EVM_VERIFY_MESSAGE:
      return await Promise.resolve(
        evmVerifyMessageWorker(request.data as EVMVerifyMessageWorkerRequest)
      );
    case HandlerWorkers.BUNDLR_VERIFY_RECEIPT:
      return await bundlrVerifyReceiptWorker(request.data as BundlrVerifyReceiptWorkerRequest);
  }
};

export const startCommunicationWorker = (): void => {
  const workerThread = require('worker_threads');
  // eslint-disable-next-line require-await
  workerThread.parentPort?.on('message', async (request: string) => {
    const handlerWorkerData = JSON.parse(request) as HandlerWorkerData;
    const result = await executeWorker(handlerWorkerData);

    workerThread.parentPort!.postMessage(result);
  });
};
