import { DAPublicationWithTimestampProofsBatchResult } from '../../data-availability-models/data-availability-timestamp-proofs';
import { checkDAProofWithMetadata } from '../../proofs/check-da-proof';
import { CheckDASubmissionOptions } from '../../proofs/models/check-da-submisson-options';
import { ethereumNode } from '../../runnable/ethereum-node-instance';

export interface CheckDAProofsWihMetadataBatchWorkerRequest {
  txId: string;
  daPublicationWithTimestampProofs: DAPublicationWithTimestampProofsBatchResult;
  options: CheckDASubmissionOptions;
}

// export interface CheckDAProofsWihMetadataBatchWorkerResponse {}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const checkDAProofsWithMetadataBatchWorker = async (
  request: CheckDAProofsWihMetadataBatchWorkerRequest[]
) => {
  console.log('checkDAProofsWithMetadataBatchWorker');

  const result = await Promise.all(
    request.map(async (r) => {
      const hey = true;
      await checkDAProofWithMetadata(
        r.txId,
        r.daPublicationWithTimestampProofs,
        ethereumNode,
        r.options
      );
      return hey;
    })
  );

  console.log('checkDAProofsWithMetadataBatchWorker - DONEEE');
  return result;
};
