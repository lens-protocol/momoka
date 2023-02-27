import { Environment } from '../environment';
import { DataAvailabilityTransactionsDocument } from '../graphql/generated';
import { client } from '../graphql/urql.client';
import { getSubmitters } from '../submitters';

export interface getDataAvailabilityTransactionsAPIResponse {
  edges: {
    node: {
      id: string;
      address: string;
    };
    cursor: string;
  }[];
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string | null;
  };
}

export const getDataAvailabilityTransactionsAPI = async (
  environment: Environment,
  isStaging: boolean,
  cursor: string | null
): Promise<getDataAvailabilityTransactionsAPIResponse> => {
  const result = await client
    .query(DataAvailabilityTransactionsDocument, {
      owners: getSubmitters(environment, isStaging),
      after: cursor,
      limit: 1000,
    })
    .toPromise();

  return result.data!.transactions as getDataAvailabilityTransactionsAPIResponse;
};
