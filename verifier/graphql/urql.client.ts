import { createClient } from '@urql/core';
import fetch from 'node-fetch-commonjs';

export const client = createClient({
  url: 'https://arweave.net/graphql',
  fetch: fetch as any,
  requestPolicy: 'network-only',
});
