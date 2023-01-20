import Utils from '@bundlr-network/client/build/common/utils';
import { utils } from 'ethers';
import { getArweaveByIdAPI } from './arweave/get-arweave-by-id.api';
import {
  getDataAvailabilityTransactionsAPI,
  getDataAvailabilityTransactionsAPIResponse,
} from './bundlr/get-data-availability-transactions.api';
import { CheckDASubmissionOptions } from './check-da-submisson-options';
import { ClaimableValidatorError } from './claimable-validator-errors';
import { failure, PromiseResult, success } from './da-result';
import { DAActionTypes } from './data-availability-models/data-availability-action-types';
import {
  DAEventType,
  DAStructurePublication,
  PublicationTypedData,
} from './data-availability-models/publications/data-availability-structure-publication';
import {
  FailedTransactionsDb,
  getBlockDb,
  getFailedTransactionsDb,
  saveBlockDb,
  saveFailedTransactionDb,
  saveTxDb,
  txExistsDb,
  txSuccessDb,
} from './db';
import { ethereumProvider, getBlockWithRetries } from './ethereum';
import { deepClone, sleep } from './helpers';
import { consoleLog } from './logger';
import { checkDAComment, CheckDACommentPublication } from './publications/comment';
import { checkDAMirror, CheckDAMirrorPublication } from './publications/mirror';
import { checkDAPost, CheckDAPostPublication } from './publications/post';
import { isValidSubmitter, isValidTransactionSubmitter } from './submitters';

const validateChoosenBlock = async (
  blockNumber: number,
  timestamp: number,
  log: (message: string, ...optionalParams: any[]) => void
): PromiseResult => {
  try {
    // got the current block the previous block and the block in the future!
    const blockNumbers = [
      deepClone(blockNumber) - 1,
      deepClone(blockNumber),
      deepClone(blockNumber) + 1,
    ];

    const blocks = await Promise.all(
      blockNumbers.map(async (blockNumber) => {
        const cachedBlock = await getBlockDb(blockNumber);
        if (cachedBlock) {
          return cachedBlock;
        }

        const block = await getBlockWithRetries(blockNumber);

        // fire and forget!
        saveBlockDb(block);

        return block;
      })
    );

    log(
      'blocks',
      blocks.map((c) => {
        return { time: c.timestamp * 1000, blockNumber: c.number };
      })
    );
    log('timestamp', timestamp);

    const closestBlock = blocks
      // turn to ms!
      .map((c) => {
        return {
          ...c,
          timestamp: c.timestamp * 1000,
        };
      })
      // nothing before it!
      .filter((c) => timestamp >= c.timestamp)
      .reduce((prev, curr) => {
        return Math.abs(curr.timestamp - timestamp) < Math.abs(prev.timestamp - timestamp)
          ? curr
          : prev;
      });

    // compare block numbers to make sure they are the same
    if (closestBlock.number !== blockNumber) {
      log('closestBlock does not match', {
        closestBlock: closestBlock.number,
        submittedBlockNumber: blockNumber,
        closestBlockFull: closestBlock,
      });

      if (closestBlock.number === deepClone(blockNumber) + 1) {
        log(
          `
        Due to latency with nodes we allow the next block to be accepted as the closest.
        When you do a request over the wire the node provider may not of broadcasted yet,
        this means you may have 100-300ms latency which can not be avoided. The signature still
        needs to conform to the past block so its still very valid.
        `
        );
      } else {
        return failure(ClaimableValidatorError.NOT_CLOSEST_BLOCK);
      }
    }

    log('compare done', {
      choosenBlock: closestBlock.timestamp,
      timestamp,
    });

    // T-139 to look at this later!
    // if (closestBlock.number + 2500 > timestamp) {
    //   throw new Error(ClaimableValidatorError.BLOCK_TOO_FAR);
    // }

    return success();
  } catch (e) {
    log('validateChoosenBlock error', e);
    return failure(ClaimableValidatorError.UNKNOWN);
  }
};

export const checkDASubmisson = async (
  txId: string,
  { log, verifyPointer }: CheckDASubmissionOptions = { log: consoleLog, verifyPointer: true }
): PromiseResult => {
  // pointers have the ar prefix!
  txId = txId.replace('ar://', '');

  log(`Checking the submission`);

  // no need to recheck something already processed
  const alreadyChecked = await txExistsDb(txId);
  if (alreadyChecked) {
    log('Already checked submission');
    return success();
  }

  const daPublication = await getArweaveByIdAPI<
    DAStructurePublication<DAEventType, PublicationTypedData>
  >(txId);
  log('getArweaveByIdAPI result', daPublication);
  // log('getArweaveByIdAPI typed data', daPublication.chainProofs.thisPublication.typedData);

  if (!daPublication.signature) {
    return failure(ClaimableValidatorError.NO_SIGNATURE_SUBMITTER);
  }

  let signature = deepClone(daPublication.signature);

  // @ts-ignore
  delete daPublication.signature;

  // check if signature matches!
  const signedAddress = utils.verifyMessage(JSON.stringify(daPublication), signature);
  log('signedAddress', signedAddress);

  if (!isValidSubmitter(signedAddress)) {
    return failure(ClaimableValidatorError.INVALID_SIGNATURE_SUBMITTER);
  }

  // check if bundlr timestamp proofs are valid and verified against bundlr node
  const valid = await Utils.verifyReceipt(daPublication.timestampProofs.response);
  if (!valid) {
    log('timestamp proof invalid signature');
    return failure(ClaimableValidatorError.TIMESTAMP_PROOF_INVALID_SIGNATURE);
  }

  log('timestamp proof signature valid');

  // 2. fetch the `daPublication.timestampProofs.id` from arweave graphql node, checked `dataAvailabilityId` and type match!

  // TODO: insert code here

  // check the wallet who uploaded it is within the submittors wallet list
  const timestampProofsSubmitter = await isValidTransactionSubmitter(
    daPublication.timestampProofs.response.id,
    log
  );
  if (!timestampProofsSubmitter) {
    log('timestamp proof invalid submitter');
    return failure(ClaimableValidatorError.TIMESTAMP_PROOF_NOT_SUBMITTER);
  }

  log('timestamp proof valid submitter');

  if (daPublication.event.timestamp !== daPublication.chainProofs.thisPublication.blockTimestamp) {
    log('event timestamp does not match the publication timestamp');
    // the event emitted must match the same timestamp as the block number
    return failure(ClaimableValidatorError.INVALID_EVENT_TIMESTAMP);
  }

  log('event timestamp matches publication timestamp');

  // // must be the closest block to the timestamp proofs
  const validateBlockResult = await validateChoosenBlock(
    daPublication.chainProofs.thisPublication.blockNumber,
    daPublication.timestampProofs.response.timestamp,
    log
  );

  if (validateBlockResult.isFailure()) {
    return validateBlockResult;
  }

  log('event timestamp matches up the on chain block timestamp');

  switch (daPublication.type) {
    case DAActionTypes.POST_CREATED:
      if (daPublication.chainProofs.pointer) {
        return failure(ClaimableValidatorError.INVALID_POINTER_SET_NOT_NEEDED);
      }
      await checkDAPost(daPublication as CheckDAPostPublication, log);
      break;
    case DAActionTypes.COMMENT_CREATED:
      await checkDAComment(daPublication as CheckDACommentPublication, verifyPointer, log);
      break;
    case DAActionTypes.MIRROR_CREATED:
      await checkDAMirror(daPublication as CheckDAMirrorPublication, verifyPointer, log);
      break;
    default:
      return failure(ClaimableValidatorError.UNKNOWN);
  }

  return success();
};

let _lock = false;
const processFailedSubmissions = async (
  txId: string,
  reason: ClaimableValidatorError,
  log: (message: string, ...optionalParams: any[]) => void
) => {
  while (true) {
    if (_lock) {
      log('process failed submissions already writing, await for the unlock');

      await sleep(100);
    }

    _lock = true;

    await saveFailedTransactionDb({ txId, reason });
    log('process failed submissions saved to db');

    _lock = false;
    break;
  }
};

const checkDABatch = async (
  arweaveTransactions: getDataAvailabilityTransactionsAPIResponse
): Promise<void> => {
  await Promise.all(
    arweaveTransactions!.edges.map(async (edge) => {
      const txId = edge.node.id;
      const log = (message: string, ...optionalParams: any[]) => {
        consoleLog('\x1b[32m', `LENS VERIFICATION NODE - ${txId} - ${message}`, ...optionalParams);
      };

      try {
        log('Checking submission');

        const result = await checkDASubmisson(txId, { verifyPointer: true, log });
        // write to the database!
        await saveTxDb(txId, result.isFailure() ? result.failure! : txSuccessDb);

        if (result.isFailure()) {
          // fire and forget
          processFailedSubmissions(txId, result.failure!, log);
        }

        log(
          `${
            result.isFailure()
              ? `FAILED - ${result.failure!}: the checking has flagged invalid DA publication`
              : 'SUCCESS: the checkes have all passed.'
          }`
        );
      } catch (e) {
        await saveTxDb(txId, ClaimableValidatorError.UNKNOWN);
        log('FAILED: the checking has flagged invalid DA publication', e);
      }
    })
  );

  consoleLog('Checked all submissons all is well');
};

const watchBlocks = async () => {
  consoleLog('LENS VERIFICATION NODE - started up block watching...');

  let blockNumber = 0;
  while (true) {
    try {
      const latestBlock = await ethereumProvider.getBlock('latest');
      if (latestBlock.number > blockNumber) {
        blockNumber = latestBlock.number;

        // save block fire and forget!
        saveBlockDb(latestBlock);
        consoleLog('LENS VERIFICATION NODE - New block found and saved', blockNumber);
      }
    } catch (error) {
      consoleLog('LENS VERIFICATION NODE - Error getting latest block try again in 100ms', error);
    }

    await sleep(100);
  }
};

// export const verifierWatcher2 = async () => {
//   consoleLog('LENS VERIFICATION NODE - DA verification watcher started...');

//   watchBlocks();

//   let endCursor: string | null = null;
//   let hasNextPage: undefined | boolean;
//   let lastEdgeCount: number = 0;

//   while (true) {
//     consoleLog('LENS VERIFICATION NODE - Checking for new submissions...');

//     const arweaveTransactions: getDataAvailabilityTransactionsAPIResponse =
//       await getDataAvailabilityTransactionsAPI(endCursor);

//     consoleLog('arweaveTransactions', arweaveTransactions);

//     if (
//       !arweaveTransactions.pageInfo.hasNextPage &&
//       hasNextPage === false &&
//       lastEdgeCount === arweaveTransactions.edges.length
//     ) {
//       consoleLog(
//         'LENS VERIFICATION NODE - No next page found or new items in that page found so sleep for 500 milliseconds then check again...',
//         { lastEdgeCount, realEdgeCount: arweaveTransactions.edges.length }
//       );
//       await sleep(500);
//     } else {
//       // clear up any same cursor just added to the max limit
//       // aka say we processed 224 and then limit is 1000 and then 2 new one comes in
//       // we do not want to process all 224 again only the new ones
//       console.log('blah', { cursor, real: arweaveTransactions.pageInfo.endCursor });
//       if (cursor === arweaveTransactions.pageInfo.endCursor) {
//         const newEdges = arweaveTransactions.edges.length - lastEdgeCount;
//         console.log('newEdges', newEdges);
//         if (newEdges > 0) {
//           consoleLog('LENS VERIFICATION NODE - found new tx in the same edge...', {
//             edges: newEdges,
//           });
//           arweaveTransactions.edges = arweaveTransactions.edges.slice(deepClone(lastEdgeCount) - 1);
//         }
//       }

//       if (arweaveTransactions.pageInfo.hasNextPage) {
//         consoleLog('LENS VERIFICATION NODE - Next page found so set the cursor');
//         cursor = arweaveTransactions.pageInfo.endCursor;
//         hasNextPage = true;
//       } else {
//         hasNextPage = false;
//       }

//       lastEdgeCount = arweaveTransactions.edges.length;

//       if (lastEdgeCount === 0) {
//         consoleLog(
//           'LENS VERIFICATION NODE - No more transactions to check. Sleep for 500 milliseconds then check again...'
//         );
//         await sleep(500);
//       } else {
//         consoleLog('LENS VERIFICATION NODE - Found new submissions...', lastEdgeCount);

//         // fire and forget so we can process as many as we can in concurrently!
//         // checkDABatch(arweaveTransactions);
//       }
//     }
//   }
// };

export const verifierWatcher = async () => {
  consoleLog('LENS VERIFICATION NODE - DA verification watcher started...');

  watchBlocks();

  let endCursor: string | null = null;

  while (true) {
    consoleLog('LENS VERIFICATION NODE - Checking for new submissions...');

    const arweaveTransactions: getDataAvailabilityTransactionsAPIResponse =
      await getDataAvailabilityTransactionsAPI(endCursor);

    // consoleLog('arweaveTransactions', arweaveTransactions);

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
      checkDABatch(arweaveTransactions);

      await sleep(500);
    }
  }
};

export const verifierFailedSubmissionsWatcher = async () => {
  consoleLog('LENS VERIFICATION NODE - started up failed submisson watcher...');

  let seenFailedSubmissions: FailedTransactionsDb[] = [];
  while (true) {
    try {
      const failed = await getFailedTransactionsDb();

      const unseenFailedSubmissions = failed.filter(
        (f) => !seenFailedSubmissions.find((s) => s.txId === f.txId)
      );

      if (unseenFailedSubmissions.length > 0) {
        consoleLog('LENS VERIFICATION NODE - ERROR FOUND', {
          publicationFailed: unseenFailedSubmissions,
        });
      }

      const merged = [...seenFailedSubmissions, ...failed];
      seenFailedSubmissions = [...new Map(merged.map((item) => [item.txId, item])).values()];

      consoleLog('LENS VERIFICATION NODE - finished failed watcher check again in 5 seconds');
    } catch (error) {
      consoleLog(
        'LENS VERIFICATION NODE - verifier failed watcher failed try again in 5 seconds',
        error
      );
    }

    await sleep(5000);
  }
};
