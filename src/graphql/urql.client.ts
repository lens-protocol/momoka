import { createClient } from '@urql/core';
import { fetchWithTimeout } from '../fetch-with-timeout';

export const client = createClient({
  url: 'https://node1.bundlr.network/graphql',
  fetch: fetchWithTimeout as any,
  requestPolicy: 'network-only',
});
