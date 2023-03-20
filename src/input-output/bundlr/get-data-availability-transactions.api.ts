import { Deployment, Environment } from '../../common/environment';
import { DataAvailabilityTransactionsDocument } from '../../graphql/generated';
import { client } from '../../graphql/urql.client';
import { getSubmitters } from '../../submitters';

/**
 * The response format for the `getDataAvailabilityTransactionsAPI` function.
 */
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

export enum DataAvailabilityTransactionsOrderTypes {
  ASC = 'ASC',
  DESC = 'DESC',
}

/**
 * Sends a query to the bundlr GraphQL API to retrieve data availability transactions.
 * @param environment The environment to retrieve transactions for.
 * @param deployment The deployment to retrieve transactions for, or `undefined` to retrieve transactions for all deployments.
 * @param cursor The cursor to use for paginating results, or `null` to retrieve the first page of results.
 * @returns The data availability transactions matching the given parameters.
 */
export const getDataAvailabilityTransactionsAPI = async (
  environment: Environment,
  deployment: Deployment | undefined,
  cursor: string | null,
  order: DataAvailabilityTransactionsOrderTypes,
  limit = 1000
): Promise<getDataAvailabilityTransactionsAPIResponse> => {
  const result = await client
    .query(DataAvailabilityTransactionsDocument, {
      owners: getSubmitters(environment, deployment),
      after: cursor,
      order,
      // max fetch is 1000
      limit: limit <= 1000 ? limit : 1000,
    })
    .toPromise();

  if (!result.data) {
    throw new Error('No data returned from Bundlr GraphQL API.');
  }

  return result.data.transactions as getDataAvailabilityTransactionsAPIResponse;
};
