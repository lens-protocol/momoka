import Utils from '@bundlr-network/client/build/common/utils';
import { utils } from 'ethers';
import { getArweaveByIdAPI } from './arweave/get-arweave-by-id.api';
import { getDataAvailabilityTransactionsAPI } from './bundlr/get-data-availability-transactions.api';
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

const validateChoosenBlock = async (
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

export const checkDASubmisson = async (arweaveId: string, verifyPointer = true): PromiseResult => {
  // pointers have the ar prefix!
  arweaveId = arweaveId.replace('ar://', '');

  const log = (message: string, ...optionalParams: any[]) => {
    console.log('\x1b[32m', `${arweaveId} - ${message}`, ...optionalParams);
  };

  console.time(arweaveId);
  log(`Checking the submission`);

  const daPublication = await getArweaveByIdAPI<
    DAStructurePublication<DAEventType, PublicationTypedData>
  >(arweaveId);
  log('getArweaveByIdAPI result', daPublication);
  // log('getArweaveByIdAPI typed data', daPublication.chainProofs.thisPublication.typedData);

  console.log(JSON.stringify(daPublication.chainProofs.thisPublication.typedData, null, 4));

  // check if signature matches!

  let signature = deepClone(daPublication.signature);

  // @ts-ignore
  delete daPublication.signature;

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

  // must be the closest block to the timestamp proofs
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

  console.timeEnd(arweaveId);

  return success();
};

export const verifierWatcher = async () => {
  console.log('DA verification watcher started...');

  let cursor: string | null = null;

  while (true) {
    console.log('Checking for new submissions...');
    const arweaveTransactions = await getDataAvailabilityTransactionsAPI(cursor);

    if (arweaveTransactions.pageInfo.hasNextPage) {
      console.log('Next page found so set the cursor');
      cursor = arweaveTransactions.pageInfo.endCursor;
    }

    if (arweaveTransactions.edges.length === 0) {
      console.log('No more transactions to check. Sleep for 5 seconds then check again...');
      sleep(5000);
    }

    console.log('Found new submissions...', arweaveTransactions.edges.length);

    for (let i = 0; i < arweaveTransactions!.edges.length; i++) {
      const nodeId = arweaveTransactions!.edges[i].node.id;
      console.log('Checking submission', nodeId);

      // no need to recheck something already processed
      const alreadyChecked = await existsDb(nodeId);
      if (alreadyChecked) {
        console.log('Already checked submission', nodeId);
        continue;
      }

      const result = await checkDASubmisson(nodeId);
      // write to the database!
      await putDb(nodeId, result.isFailure() ? result.failure! : successDb);

      console.log('Complete checking submission', nodeId);
    }

    console.log('Checked all submissons all is well');

    // TODO remove this :)
    break;
  }
};
