import { Queue } from './base.queue';
import { ProcessFailedProofQueueRequest } from './process-failed-da-proof.queue';
import { ProcessRetryCheckDAProofsQueueRequest } from './process-retry-check-da-proofs.queue';

/**
 * The failed proofs queue
 */
export const failedDAProofQueue = new Queue<ProcessFailedProofQueueRequest>();
/**
 * The retry check proofs queue
 */
export const retryCheckDAProofsQueue = new Queue<ProcessRetryCheckDAProofsQueueRequest>();
