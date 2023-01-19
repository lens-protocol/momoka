import { DataAvailabilityTransactionsDocument } from '../graphql/generated';
import { client } from '../graphql/urql.client';
import { getSubmitters } from '../submitters';

const submitters = getSubmitters();

export interface getDataAvailabilityTransactionsAPIResponse {
  edges: {
    node: {
      id: string;
      address: string;
    };
  }[];
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string | null;
  };
}

export const getDataAvailabilityTransactionsAPI = async (
  cursor: string | null
): Promise<getDataAvailabilityTransactionsAPIResponse> => {
  const result = await client
    .query(DataAvailabilityTransactionsDocument, {
      owners: submitters,
      after: cursor,
      limit: 1000,
    })
    .toPromise();

  return result.data!.transactions as getDataAvailabilityTransactionsAPIResponse;
};
