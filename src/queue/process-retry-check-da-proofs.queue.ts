import { runForever } from '../common/helpers';
import { MomokaValidatorError } from '../data-availability-models/validator-errors';
import { EthereumNode } from '../evm/ethereum';
import { checkDAProofsBatch } from '../proofs/check-da-proofs-batch';
import { StreamCallback } from '../watchers/models/stream.type';
import { Queue } from './base.queue';
import { retryCheckDAProofsQueue } from './known.queue';

export interface ProcessRetryCheckDAProofsQueueRequest {
  txIds: string[];
  ethereumNode: EthereumNode;
  stream: StreamCallback | undefined;
}

/**
 * Validation errors whcih should be retried due to network issues out of
 * control of the proof verifier.
 * @param validatorError The validation error to check.
 */
export const shouldRetry = (validatorError: MomokaValidatorError): boolean => {
  return (
    validatorError === MomokaValidatorError.UNKNOWN ||
    validatorError === MomokaValidatorError.CAN_NOT_CONNECT_TO_BUNDLR ||
    validatorError === MomokaValidatorError.BLOCK_CANT_BE_READ_FROM_NODE ||
    validatorError === MomokaValidatorError.DATA_CANT_BE_READ_FROM_NODE ||
    validatorError === MomokaValidatorError.SIMULATION_NODE_COULD_NOT_RUN
  );
};

/**
 * Processes the retry check proofs queue to check the proofs again (due to fails based on stuff which isnt valid)
 * @param retryQueue - The retry check proofs queue
 * @param usLocalNode - A boolean to indicate whether to use the local node.
 */
export const processRetryCheckDAProofsQueue = async (
  retryQueue: Queue<ProcessRetryCheckDAProofsQueueRequest>,
  concurrency: number,
  usLocalNode = false
): Promise<void> => {
  await runForever(async () => {
    if (!retryQueue.isEmpty()) {
      const proofs = retryQueue.dequeue();
      if (proofs && proofs.txIds.length > 0) {
        try {
          await checkDAProofsBatch(
            proofs.txIds,
            proofs.ethereumNode,
            true,
            concurrency,
            usLocalNode,
            proofs.stream
          );
        } catch (e) {
          // add back in the queue in 30 seconds for retry
          retryCheckDAProofsQueue.enqueueWithDelay(proofs, 30000);
        }
      }
    }
  }, 200);
};
