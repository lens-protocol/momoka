import Utils from '@bundlr-network/client/build/common/utils';
import { utils } from 'ethers';
import { getArweaveByIdAPI } from './arweave/get-arweave-by-id.api';
import { CheckDASubmissionOptions } from './check-da-submisson-options';
import { ClaimableValidatorError } from './claimable-validator-errors';
import { failure, PromiseResult, success } from './da-result';
import { DAActionTypes } from './data-availability-models/data-availability-action-types';
import {
  DAEventType,
  DAStructurePublication,
  PublicationTypedData,
} from './data-availability-models/publications/data-availability-structure-publication';
import { getBlockDb, saveBlockDb, txExistsDb } from './db';
import { getBlockWithRetries } from './ethereum';
import { deepClone } from './helpers';
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

export const checkDAProof = async (
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
  // log('getArweaveByIdAPI typed data', daPublication);

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

  // T-199 insert code here

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
      return await checkDAPost(daPublication as CheckDAPostPublication, log);
    case DAActionTypes.COMMENT_CREATED:
      return await checkDAComment(daPublication as CheckDACommentPublication, verifyPointer, log);
    case DAActionTypes.MIRROR_CREATED:
      return await checkDAMirror(daPublication as CheckDAMirrorPublication, verifyPointer, log);
    default:
      return failure(ClaimableValidatorError.UNKNOWN);
  }
};
