import { failedDAProofQueue, retryCheckDAProofsQueue } from './known.queue';
import { processFailedDAProofQueue } from './process-failed-da-proof.queue';
import { processRetryCheckDAProofsQueue } from './process-retry-check-da-proofs.queue';

/**
 * Starts the queues up
 */
export const startupQueues = (concurrency: number): void => {
  processFailedDAProofQueue(failedDAProofQueue);
  processRetryCheckDAProofsQueue(retryCheckDAProofsQueue, concurrency);
};
