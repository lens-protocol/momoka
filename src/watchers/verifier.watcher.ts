import { checkDAProof } from '../';
import {
  getDataAvailabilityTransactionsAPI,
  getDataAvailabilityTransactionsAPIResponse,
} from '../bundlr/get-data-availability-transactions.api';
import { ClaimableValidatorError } from '../claimable-validator-errors';
import { DAResult } from '../da-result';
import {
  DAEventType,
  DAStructurePublication,
  PublicationTypedData,
} from '../data-availability-models/publications/data-availability-structure-publication';
import {
  FailedTransactionsDb,
  saveFailedTransactionDb,
  saveTxDb,
  startDb,
  TxValidatedResult,
} from '../db';
import { EthereumNode } from '../ethereum';
import { sleep } from '../helpers';
import { consoleLog } from '../logger';
import { watchBlocks } from './block.watcher';
import { verifierFailedSubmissionsWatcher } from './failed-submissons.watcher';
import { StreamCallback } from './stream.type';

let _lock = false;
const processFailedSubmissions = async (
  failedTransaction: FailedTransactionsDb,
  log: (message: string, ...optionalParams: any[]) => void
) => {
  while (true) {
    if (_lock) {
      log('process failed submissions already writing, await for the unlock');

      await sleep(100);
    }

    _lock = true;

    await saveFailedTransactionDb(failedTransaction);
    log('process failed submissions saved to db');

    _lock = false;
    break;
  }
};

const buildTxValidationResult = (
  txId: string,
  result: DAResult<
    void | DAStructurePublication<DAEventType, PublicationTypedData>,
    DAStructurePublication<DAEventType, PublicationTypedData>
  >
): TxValidatedResult => {
  const success = result.isSuccess();
  if (success) {
    return {
      proofTxId: txId,
      success,
      dataAvailabilityResult: result.successResult!,
    } as TxValidatedResult;
  }

  return {
    proofTxId: txId,
    success,
    failureReason: result.failure!,
    dataAvailabilityResult: result.context!,
  };
};

const checkDAProofsBatch = async (
  arweaveTransactions: getDataAvailabilityTransactionsAPIResponse,
  ethereumNode: EthereumNode,
  stream?: StreamCallback
): Promise<void> => {
  await Promise.all(
    arweaveTransactions!.edges.map(async (edge) => {
      const txId = edge.node.id;
      const log = (message: string, ...optionalParams: any[]) => {
        consoleLog('\x1b[32m', `LENS VERIFICATION NODE - ${txId} - ${message}`, ...optionalParams);
      };

      try {
        log('Checking submission');

        const result = await checkDAProof(txId, ethereumNode, { verifyPointer: true, log });

        const txValidatedResult: TxValidatedResult = buildTxValidationResult(txId, result);

        // write to the database!
        await saveTxDb(txId, txValidatedResult);

        if (result.isFailure()) {
          // fire and forget
          processFailedSubmissions(
            { txId, reason: result.failure!, submitter: edge.node.address },
            log
          );
        }

        if (stream) {
          // stream the result to the callback defined
          stream(txValidatedResult);
        }

        log(
          `${
            result.isFailure()
              ? `FAILED - ${result.failure!}: the checking has flagged invalid DA publication`
              : 'SUCCESS: the checkes have all passed.'
          }`
        );
      } catch (e) {
        await saveTxDb(txId, {
          proofTxId: txId,
          success: false,
          failureReason: ClaimableValidatorError.UNKNOWN,
          dataAvailabilityResult: undefined,
        });
        log('FAILED: the checking has flagged invalid DA publication', e);
      }
    })
  );

  consoleLog('Checked all submissons all is well');
};

export const startDAVerifierNode = async (
  ethereumNode: EthereumNode,
  stream?: StreamCallback | undefined
) => {
  consoleLog('LENS VERIFICATION NODE - DA verification watcher started...');

  startDb();
  watchBlocks(ethereumNode);
  verifierFailedSubmissionsWatcher();

  let endCursor: string | null = null;

  while (true) {
    consoleLog('LENS VERIFICATION NODE - Checking for new submissions...');

    try {
      const arweaveTransactions: getDataAvailabilityTransactionsAPIResponse =
        await getDataAvailabilityTransactionsAPI(
          ethereumNode.environment,
          ethereumNode.deployment,
          endCursor
        );

      if (arweaveTransactions.edges.length === 0) {
        consoleLog('LENS VERIFICATION NODE - No new items found..');
        await sleep(500);
      } else {
        consoleLog(
          'LENS VERIFICATION NODE - Found new submissions...',
          arweaveTransactions.edges.length
        );

        endCursor = arweaveTransactions.pageInfo.endCursor;

        // fire and forget so we can process as many as we can in concurrently!
        checkDAProofsBatch(arweaveTransactions, ethereumNode, stream);

        await sleep(500);
      }
    } catch (error) {
      consoleLog('LENS VERIFICATION NODE - Error while checking for new submissions', error);
      await sleep(500);
    }
  }
};
