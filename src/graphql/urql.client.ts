import { createClient } from '@urql/core';
import { BUNDLR_NODE_GRAPHQL } from '../bundlr/bundlr-config';

export const client = createClient({
  url: BUNDLR_NODE_GRAPHQL,
  fetch: fetch as any,
  requestPolicy: 'network-only',
});
