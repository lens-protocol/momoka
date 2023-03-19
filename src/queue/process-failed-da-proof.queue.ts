import { existsSync, promises as fs } from 'fs';
import path from 'path';
import { runForever, sleep } from '../common/helpers';
import { ClaimableValidatorError } from '../data-availability-models/claimable-validator-errors';
import { FAILED_PROOFS_PATHS } from '../input-output/paths';
import { Queue } from './base.queue';
import { failedDAProofQueue } from './known.queue';

export interface ProcessFailedProofQueueRequest {
  txId: string;
  reason: ClaimableValidatorError;
  submitter: string;
}

const writeFailedProof = async (failed: ProcessFailedProofQueueRequest): Promise<void> => {
  const errorLocation = path.join(FAILED_PROOFS_PATHS, failed.reason);
  if (!existsSync(errorLocation)) {
    await fs.mkdir(errorLocation);
  }

  await fs.writeFile(path.join(errorLocation, failed.txId + '.json'), JSON.stringify(failed));
};

/**
 * Processes the failed proofs queue to save them on disk
 * @param failedQueue - The failed proofs queue
 */
export const processFailedDAProofQueue = async (
  failedQueue: Queue<ProcessFailedProofQueueRequest>
): Promise<void> => {
  await runForever(async () => {
    if (!failedQueue.isEmpty()) {
      const failed = failedQueue.dequeue();
      if (failed) {
        try {
          await writeFailedProof(failed);
        } catch (e) {
          console.error(
            'Error writing the disk for failed publication.. make sure you have enough disk space'
          );

          // add back in the queue in 30 seconds for retry
          failedDAProofQueue.enqueueWithDelay(failed, 30000);
        }
      }
    } else {
      // Wait for a short period before checking the queue again
      await sleep(200);
    }
  });
};
