import { TimeoutError, TIMEOUT_ERROR } from '../fetch-with-timeout';
import { TransactionOwnersDocument } from '../graphql/generated';
import { client } from '../graphql/urql.client';
import { sleep } from '../helpers';

export const getOwnerOfTransactionAPI = async (
  arweaveId: string,
  attempts = 0
): Promise<string | null | TimeoutError> => {
  try {
    const result = await client
      .query(TransactionOwnersDocument, {
        id: arweaveId,
      })
      .toPromise();

    if (!result.data?.transactions?.edges) {
      return null;
    }

    return result.data.transactions.edges[0]?.node.address || null;
  } catch (_error) {
    if (attempts > 3) {
      return TIMEOUT_ERROR;
    }

    // sleep for 300ms and try again
    sleep(300);
    return await getOwnerOfTransactionAPI(arweaveId, attempts + 1);
  }
};
