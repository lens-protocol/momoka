import { Deployment, Environment } from '../common/environment';
import { sleep } from '../common/helpers';
import { consoleLog } from '../common/logger';
import { getBundlrBulkTxsAPI } from '../input-output/bundlr/get-bundlr-bulk-txs.api';
import {
  getDataAvailabilityTransactionsAPI,
  getDataAvailabilityTransactionsAPIResponse,
} from '../input-output/bundlr/get-data-availability-transactions.api';
import { TIMEOUT_ERROR } from '../input-output/common';
import { buildDAPublicationsBatchResult } from '../proofs/check-da-proofs-batch';
import { StreamCallback } from './models/stream.type';

/**
 * The DA trusting indexer request.
 */
export interface StartDATrustingIndexingRequest {
  stream: StreamCallback;
  environment: Environment;
  /**
   * The deployment to use, only use this if you know what you are doing.
   */
  deployment?: Deployment;
}

/**
 * Starts the DA trusting indexing to watch for new data availability coming in and index them.
 * @param request The trusting index request
 */
export const startDATrustingIndexing = async (
  request: StartDATrustingIndexingRequest
): Promise<never> => {
  consoleLog('LENS DA TRUSTING INDEXING - DA verification indexing starting...');

  let endCursor: string | null = null;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      // Get new data availability transactions from the server.
      const arweaveTransactions: getDataAvailabilityTransactionsAPIResponse =
        await getDataAvailabilityTransactionsAPI(
          request.environment,
          request.deployment,
          endCursor
        );

      if (arweaveTransactions.edges.length === 0) {
        consoleLog('LENS DA TRUSTING INDEXING - No new DA items found..');
        // Sleep for 100ms before checking again.
        await sleep(100);
      } else {
        consoleLog(
          'LENS DA TRUSTING INDEXING - Found new submissions...',
          arweaveTransactions.edges.length
        );

        const bulkDAProofs = await getBundlrBulkTxsAPI(
          arweaveTransactions.edges.map((edge) => edge.node.id)
        );
        if (bulkDAProofs === TIMEOUT_ERROR) {
          throw new Error('getBundlrBulkTxsAPI for proofs timed out');
        }

        // Build the data availability publication result for each submission.
        const daPublications = await buildDAPublicationsBatchResult(bulkDAProofs.success);

        // Stream the results to the callback.
        daPublications.map((publication) => {
          request.stream({
            proofTxId: publication.id,
            success: true,
            dataAvailabilityResult: publication.daPublication,
          });
        });

        endCursor = arweaveTransactions.pageInfo.endCursor;
      }
    } catch (error) {
      consoleLog('LENS DA TRUSTING INDEXING - Error while checking for new submissions', error);
      await sleep(100);
    }
  }
};
