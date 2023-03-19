import { runForever, sleep } from '../common/helpers';
import { ClaimableValidatorError } from '../data-availability-models/claimable-validator-errors';
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
 * Claim validation errors whcih should be retried due to network issues out of
 * control of the proof verifier.
 * @param claimableValidatorError The claim validation error to check.
 */
export const shouldRetry = (claimableValidatorError: ClaimableValidatorError): boolean => {
  return (
    claimableValidatorError === ClaimableValidatorError.UNKNOWN ||
    claimableValidatorError === ClaimableValidatorError.CAN_NOT_CONNECT_TO_BUNDLR ||
    claimableValidatorError === ClaimableValidatorError.BLOCK_CANT_BE_READ_FROM_NODE ||
    claimableValidatorError === ClaimableValidatorError.DATA_CANT_BE_READ_FROM_NODE ||
    claimableValidatorError === ClaimableValidatorError.SIMULATION_NODE_COULD_NOT_RUN
  );
};

/**
 * Processes the retry check proofs queue to check the proofs again (due to fails based on stuff which isnt valid)
 * @param retryQueue - The retry check proofs queue
 * @param usLocalNode - A boolean to indicate whether to use the local node.
 */
export const processRetryCheckDAProofsQueue = async (
  retryQueue: Queue<ProcessRetryCheckDAProofsQueueRequest>,
  usLocalNode = false
): Promise<void> => {
  await runForever(async () => {
    if (!retryQueue.isEmpty()) {
      const proofs = retryQueue.dequeue();
      if (proofs) {
        try {
          await checkDAProofsBatch(
            proofs.txIds,
            proofs.ethereumNode,
            true,
            usLocalNode,
            proofs.stream
          );
        } catch (e) {
          // add back in the queue in 30 seconds for retry
          retryCheckDAProofsQueue.enqueueWithDelay(proofs, 30000);
        }
      }
    } else {
      // Wait for a short period before checking the queue again
      await sleep(200);
    }
  });
};
