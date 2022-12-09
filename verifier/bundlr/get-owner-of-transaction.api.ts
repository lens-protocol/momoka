import { TransactionOwnersDocument } from '../graphql/generated';
import { client } from '../graphql/urql.client';

export interface getOwnerOfTransactionAPIResponse {
  id: string;
  address: string | null;
}

const mapToUnknown = (arweaveIds: string[]) => {
  return arweaveIds.map((a) => {
    return {
      id: a,
      address: null,
    };
  });
};

export const getOwnerOfTransactionsAPI = async (
  arweaveIds: string[]
): Promise<getOwnerOfTransactionAPIResponse[]> => {
  const result = await client
    .query(TransactionOwnersDocument, {
      ids: arweaveIds,
    })
    .toPromise();

  console.log('result', result);

  if (!result.data?.transactions?.edges) {
    return mapToUnknown(arweaveIds);
  }

  // get the first address
  const knownTransactions = result.data.transactions.edges.map((a) => {
    return {
      id: a!.node.id,
      address: a!.node.address,
    };
  });

  return [...mapToUnknown(arweaveIds), ...knownTransactions];
};
