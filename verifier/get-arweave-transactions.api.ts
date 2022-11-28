import { SortOrder, TransactionsDocument } from './graphql/generated';
import { client } from './graphql/urql.client';

// TODO pass in proper tag!
export const getArweaveTransactionsAPI = async (
  tag = 'UDHFJAFHADSFHADSIHFADSIHFASDHFAHSDF'
) => {
  const result = await client
    .query(TransactionsDocument, {
      tags: [
        {
          values: ['true'],
          name: tag,
        },
      ],
      sort: SortOrder.HeightDesc,
      first: 200,
    })
    .toPromise();

  console.log('result', result);

  return result.data?.transactions;
};
