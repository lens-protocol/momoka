import Utils from '@bundlr-network/client/build/common/utils';
import { utils } from 'ethers';
import { getArweaveByIdAPI } from './arweave/get-arweave-by-id.api';
import { getDataAvailabilityTransactionsAPI } from './bundlr/get-data-availability-transactions.api';
import { ClaimableValidatorError } from './claimable-validator-errors';
import { DAActionTypes } from './data-availability-models/data-availability-action-types';
import {
  DAEventType,
  DAStructurePublication,
  PublicationTypedData,
} from './data-availability-models/publications/data-availability-structure-publication';
import { ethereumProvider } from './ethereum';
import { deepClone, sleep } from './helpers';
import { checkDAComment, CheckDACommentPublication } from './publications/comment';
import { checkDAMirror, CheckDAMirrorPublication } from './publications/mirror';
import { checkDAPost, CheckDAPostPublication } from './publications/post';
import { isValidSubmitter, isValidTransactionSubmitter } from './submitters';

const validateChoosenBlock = async (blockNumber: number, timestamp: number) => {
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

  const closestBlock = blocks
    // turn to ms!
    .map((c) => {
      return {
        ...c,
        timestamp: c.timestamp * 1000,
      };
    })
    // nothing before it!
    .filter((c) => c.timestamp <= timestamp)
    .reduce((a, b) => {
      let aDiff = Math.abs(a.timestamp - timestamp);
      let bDiff = Math.abs(b.timestamp - timestamp);

      if (aDiff == bDiff) {
        // Choose smallest timestamp
        return a < b ? a : b;
      } else {
        return bDiff < aDiff ? b : a;
      }
    });

  // compare block numbers to make sure they are the same
  if (closestBlock.number !== blockNumber) {
    throw new Error(ClaimableValidatorError.NOT_CLOSEST_BLOCK);
  }

  console.log('compare', {
    choosenBlock: closestBlock.timestamp,
    timestamp,
  });

  // TODO to look at this later!
  // if (closestBlock.number + 2500 > timestamp) {
  //   throw new Error(ClaimableValidatorError.BLOCK_TOO_FAR);
  // }
};

export const checkDASubmisson = async (arweaveId: string, verifyPointer = true) => {
  const log = (message: string, ...optionalParams: any[]) => {
    console.log(`${arweaveId} - ${message}`, ...optionalParams);
  };

  log(`Checking for submission - ${arweaveId}`);

  const daPublication = await getArweaveByIdAPI<
    DAStructurePublication<DAEventType, PublicationTypedData>
  >(arweaveId);
  log('getArweaveByIdAPI result', daPublication);

  // check if signature matches!

  let signature = deepClone(daPublication.signature);

  // @ts-ignore
  delete daPublication.signature;

  const signedAddress = utils.verifyMessage(JSON.stringify(daPublication), signature);
  log('signedAddress', signedAddress);

  if (!isValidSubmitter(signedAddress)) {
    throw new Error(ClaimableValidatorError.INVALID_SIGNATURE_SUBMITTER);
  }

  // check if bundlr timestamp proofs are valid and verified against bundlr node
  const valid = await Utils.verifyReceipt(daPublication.timestampProofs.response);
  if (!valid) {
    log('timestamp proof invalid signature');
    throw new Error(ClaimableValidatorError.TIMESTAMP_PROOF_INVALID_SIGNATURE);
  }

  log('timestamp proof signature valid');

  // 2. fetch the `daPublication.timestampProofs.id` from arweave graphql node, checked `dataAvailabilityId` and type match!

  // TODO: insert code here

  // check the wallet who uploaded it is within the submittors wallet list
  const timestampProofsSubmitter = await isValidTransactionSubmitter(
    daPublication.timestampProofs.response.id
  );
  if (!timestampProofsSubmitter) {
    log('timestamp proof invalid submitter');
    throw new Error(ClaimableValidatorError.TIMESTAMP_PROOF_NOT_SUBMITTER);
  }

  log('timestamp proof valid submitter');

  if (daPublication.event.timestamp !== daPublication.chainProofs.thisPublication.blockTimestamp) {
    log('event timestamp does not match the publication timestamp');
    // the event emitted must match the same timestamp as the block number
    throw new Error(ClaimableValidatorError.INVALID_EVENT_TIMESTAMP);
  }

  log('event timestamp matches publication timestamp');

  // must be the closest block to the timestamp proofs
  await validateChoosenBlock(
    daPublication.chainProofs.thisPublication.blockNumber,
    daPublication.timestampProofs.response.timestamp
  );

  log('event timestamp matches up the on chain block timestamp');

  switch (daPublication.type) {
    case DAActionTypes.POST_CREATED:
      if (daPublication.chainProofs.pointer) {
        throw new Error(ClaimableValidatorError.INVALID_POINTER_SET_NOT_NEEDED);
      }
      await checkDAPost(daPublication as CheckDAPostPublication);
      break;
    case DAActionTypes.COMMENT_CREATED:
      await checkDAComment(daPublication as CheckDACommentPublication, verifyPointer);
      break;
    case DAActionTypes.MIRROR_CREATED:
      await checkDAMirror(daPublication as CheckDAMirrorPublication, verifyPointer);
      break;
    default:
      throw new Error('Unknown type');
  }
};

export const verifierWatcher = async () => {
  console.log('Verify watcher started');

  let cursor: string | null = null;

  while (true) {
    console.log('Checking for new submissions');
    const arweaveTransactions = await getDataAvailabilityTransactionsAPI(cursor);

    if (arweaveTransactions.pageInfo.hasNextPage) {
      console.log('Next page found so set the cursor');
      cursor = arweaveTransactions.pageInfo.endCursor;
    }

    if (arweaveTransactions.edges.length === 0) {
      console.log('No more transactions to check. Sleep for 5 seconds then check again');
      sleep(5000);
    }

    console.log('Found new submissions', arweaveTransactions.edges.length);

    for (let i = 0; i < arweaveTransactions!.edges.length; i++) {
      await checkDASubmisson(arweaveTransactions!.edges[i].node.id);
    }

    console.log('Checked all submissons all is well');

    // TODO remove this :)
    break;
  }
};
