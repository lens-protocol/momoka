import { createClient } from '@urql/core';
import { BUNDLR_NODE_GRAPHQL } from '../input-output/bundlr/bundlr-config';

export const client = createClient({
  url: BUNDLR_NODE_GRAPHQL,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fetch: fetch as any,
  requestPolicy: 'network-only',
});
