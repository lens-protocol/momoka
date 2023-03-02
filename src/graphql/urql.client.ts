import { createClient } from '@urql/core';

export const client = createClient({
  url: 'https://node1.bundlr.network/graphql',
  fetch: fetch,
  requestPolicy: 'network-only',
});
