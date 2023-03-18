import { checkDAProofsBatch, ProofResult } from '../../proofs/check-da-proofs-batch';
import { ethereumNode } from '../../runnable/ethereum-node-instance';

export const checkDAProofsBatchWorker = async (txIds: string[]): Promise<ProofResult[]> => {
  console.log('heyyheyeyehe');
  const result = await checkDAProofsBatch(txIds, ethereumNode, false);
  console.log('heyyheyeyehe - DONEEE');
  return result;
};
