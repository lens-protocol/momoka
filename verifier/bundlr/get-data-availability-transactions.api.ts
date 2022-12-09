import { DataAvailabilityTransactionsDocument } from '../graphql/generated';
import { client } from '../graphql/urql.client';
import { getSubmitters } from '../submitters';

const submitters = getSubmitters();

export const getDataAvailabilityTransactionsAPI = async (cursor: string | null) => {
  const result = await client
    .query(DataAvailabilityTransactionsDocument, {
      owners: submitters,
      after: cursor,
    })
    .toPromise();

  console.log('result', result);

  return result.data?.transactions;
};
