import { TransactionOwnersDocument } from '../graphql/generated';
import { client } from '../graphql/urql.client';

export const getOwnerOfTransactionAPI = async (arweaveId: string): Promise<string | null> => {
  const result = await client
    .query(TransactionOwnersDocument, {
      id: arweaveId,
    })
    .toPromise();

  // console.log('result', result);

  if (!result.data?.transactions?.edges) {
    return null;
  }

  return result.data.transactions.edges[0]?.node.address || null;
};
