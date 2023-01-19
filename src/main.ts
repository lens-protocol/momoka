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
import { existsDb, putDb, successDb } from './db';
import { ethereumProvider } from './ethereum';
import { deepClone, sleep } from './helpers';
import { checkDAComment, CheckDACommentPublication } from './publications/comment';
import { checkDAMirror, CheckDAMirrorPublication } from './publications/mirror';
import { checkDAPost, CheckDAPostPublication } from './publications/post';
import { isValidSubmitter, isValidTransactionSubmitter } from './submitters';

export const validateChoosenBlock = async (
  blockNumber: number,
  timestamp: number,
  log: (message: string, ...optionalParams: any[]) => void
): PromiseResult => {
  // get 5 blocks in front and 5 blocks behind
  let startForward = deepClone(blockNumber);
  const blocksInFront = Array(deepClone(startForward) + 5 - startForward)
    .fill(undefined)
    .map((_, idx) => startForward + idx);

  const startBack = deepClone(blockNumber) - 5;
  const blocksBehind = Array(blockNumber - startBack)
    .fill(undefined)
    .map((_, idx) => startBack + idx);

  const blockNumbers = [...blocksBehind, ...blocksInFront];
  const blocks = await Promise.all(
    blockNumbers.map((blockNumber) => ethereumProvider.getBlock(blockNumber))
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

  // TODO to look at this later!
  // if (closestBlock.number + 2500 > timestamp) {
  //   throw new Error(ClaimableValidatorError.BLOCK_TOO_FAR);
  // }

  return success();
};

export const checkDASubmisson = async (
  txId: string,
  { log, verifyPointer }: CheckDASubmissionOptions
): PromiseResult => {
  // pointers have the ar prefix!
  txId = txId.replace('ar://', '');

  log(`Checking the submission`);

  // no need to recheck something already processed
  const alreadyChecked = await existsDb(txId);
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
  // const validateBlockResult = await validateChoosenBlock(
  //   daPublication.chainProofs.thisPublication.blockNumber,
  //   daPublication.timestampProofs.response.timestamp,
  //   log
  // );

  // if (validateBlockResult.isFailure()) {
  //   return validateBlockResult;
  // }

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

export const checkDABatch = async (
  arweaveTransactions: getDataAvailabilityTransactionsAPIResponse
): Promise<void> => {
  await Promise.all(
    arweaveTransactions!.edges.map(async (edge) => {
      const txId = edge.node.id;
      const log = (message: string, ...optionalParams: any[]) => {
        console.log('\x1b[32m', `LENS VERIFICATION NODE - ${txId} - ${message}`, ...optionalParams);
      };

      try {
        log('Checking submission');

        const result = await checkDASubmisson(txId, { verifyPointer: true, log: () => {} });
        // write to the database!
        await putDb(txId, result.isFailure() ? result.failure! : successDb);

        log(
          `${
            result.isFailure()
              ? `FAILED - ${result.failure!}: the checking has flagged invalid DA publication`
              : 'SUCCESS: the checkes have all passed.'
          }`
        );
      } catch (e) {
        await putDb(txId, ClaimableValidatorError.UNKNOWN);
        log('FAILED: the checking has flagged invalid DA publication', e);
      }
    })
  );

  console.log('Checked all submissons all is well');
};

export const verifierWatcher = async () => {
  console.log('LENS VERIFICATION NODE - DA verification watcher started...');

  let cursor: string | null = null;
  let noNextPage: undefined | boolean;

  while (true) {
    console.log('LENS VERIFICATION NODE - Checking for new submissions...');

    const arweaveTransactions: getDataAvailabilityTransactionsAPIResponse =
      await getDataAvailabilityTransactionsAPI(cursor);

    // console.log('arweaveTransactions', arweaveTransactions);

    if (!arweaveTransactions.pageInfo.hasNextPage && noNextPage === false) {
      console.log(
        'LENS VERIFICATION NODE - No next page found so sleep for 500 milliseconds then check again...'
      );
      sleep(500);
    } else {
      if (arweaveTransactions.pageInfo.hasNextPage) {
        console.log('LENS VERIFICATION NODE - Next page found so set the cursor');
        cursor = arweaveTransactions.pageInfo.endCursor;
        noNextPage = true;
      } else {
        noNextPage = false;
      }

      if (arweaveTransactions.edges.length === 0) {
        console.log(
          'LENS VERIFICATION NODE - No more transactions to check. Sleep for 500 milliseconds then check again...'
        );
        sleep(500);
      } else {
        console.log(
          'LENS VERIFICATION NODE - Found new submissions...',
          arweaveTransactions.edges.length
        );

        // fire and forget so we can process as many as we can in concurrently!
        checkDABatch(arweaveTransactions);
      }
    }
  }
};
