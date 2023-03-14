import Utils from '@bundlr-network/client/build/common/utils';
import { utils } from 'ethers';
import { getArweaveByIdAPI } from './arweave/get-arweave-by-id.api';
import { CheckDASubmissionOptions } from './check-da-submisson-options';
import { ClaimableValidatorError } from './claimable-validator-errors';
import {
  failure,
  failureWithContext,
  PromiseResult,
  PromiseWithContextResult,
  PromiseWithContextResultOrNull,
  success,
  successWithContext,
} from './da-result';
import { DAActionTypes } from './data-availability-models/data-availability-action-types';
import {
  DAPublicationWithTimestampProofsBatchResult,
  DATimestampProofsResponse,
} from './data-availability-models/data-availability-timestamp-proofs';
import {
  DAEventType,
  DAStructurePublication,
  PublicationTypedData,
} from './data-availability-models/publications/data-availability-structure-publication';
import {
  getBlockDb,
  getTxDAMetadataDb,
  getTxDb,
  getTxTimestampProofsMetadataDb,
  saveBlockDb,
  TxValidatedFailureResult,
} from './db';
import { BlockInfo, EthereumNode, getBlock } from './ethereum';
import { TIMEOUT_ERROR } from './fetch-with-timeout';
import { deepClone } from './helpers';
import { checkDAComment, CheckDACommentPublication } from './publications/comment';
import { checkDAMirror, CheckDAMirrorPublication } from './publications/mirror';
import { checkDAPost, CheckDAPostPublication } from './publications/post';
import { isValidSubmitter, isValidTransactionSubmitter } from './submitters';

const getClosestBlock = (blocks: BlockInfo[], timestamp: number): BlockInfo => {
  return blocks
    .map((c) => ({
      ...c,
      // turn to ms!
      timestamp: c.timestamp * 1000,
    }))
    .filter((c) => timestamp >= c.timestamp)
    .reduce((prev, curr) => {
      return Math.abs(curr.timestamp - timestamp) < Math.abs(prev.timestamp - timestamp)
        ? curr
        : prev;
    });
};

const getBlockRange = async (
  blockNumbers: number[],
  ethereumNode: EthereumNode
): PromiseResult<BlockInfo[] | void> => {
  try {
    const blocks = await Promise.all(
      blockNumbers.map(async (blockNumber) => {
        const cachedBlock = await getBlockDb(blockNumber);
        if (cachedBlock) {
          return cachedBlock;
        }

        const block = await getBlock(blockNumber, ethereumNode);

        // fire and forget!
        saveBlockDb(block);

        return block;
      })
    );

    return success(blocks);
  } catch (error) {
    console.error('getBlockRange', error);
    return failure(ClaimableValidatorError.BLOCK_CANT_BE_READ_FROM_NODE);
  }
};

const validateChoosenBlock = async (
  blockNumber: number,
  timestamp: number,
  ethereumNode: EthereumNode,
  log: (message: string, ...optionalParams: any[]) => void
): PromiseResult => {
  try {
    // got the current block the previous block and the block in the future!
    const blockNumbers = [
      deepClone(blockNumber) - 1,
      deepClone(blockNumber),
      deepClone(blockNumber) + 1,
    ];

    const blocksResult = await getBlockRange(blockNumbers, ethereumNode);

    if (blocksResult.isFailure()) {
      return failure(blocksResult.failure!);
    }

    const blocks = blocksResult.successResult!;
    log(
      'blocks',
      blocks.map((c) => ({ time: c.timestamp * 1000, blockNumber: c.number }))
    );
    log('timestamp', timestamp);

    const closestBlock = getClosestBlock(blocks, timestamp);

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
  } catch (e) {
    log('validateChoosenBlock error', e);
    return failure(ClaimableValidatorError.UNKNOWN);
  }
};

const generatePublicationId = (
  daPublication: DAStructurePublication<DAEventType, PublicationTypedData>
): string => {
  return `${daPublication.event.profileId}-${daPublication.event.pubId}-DA-${
    daPublication.dataAvailabilityId.split('-')[0]
  }`;
};

const checkDAPublication = async (
  daPublication: DAStructurePublication<DAEventType, PublicationTypedData>,
  ethereumNode: EthereumNode,
  { log, verifyPointer }: CheckDASubmissionOptions
): PromiseResult => {
  switch (daPublication.type) {
    case DAActionTypes.POST_CREATED:
      if (daPublication.chainProofs.pointer) {
        return failure(ClaimableValidatorError.INVALID_POINTER_SET_NOT_NEEDED);
      }
      return await checkDAPost(daPublication as CheckDAPostPublication, ethereumNode, log);
    case DAActionTypes.COMMENT_CREATED:
      return await checkDAComment(
        daPublication as CheckDACommentPublication,
        verifyPointer,
        ethereumNode,
        log
      );
    case DAActionTypes.MIRROR_CREATED:
      return await checkDAMirror(
        daPublication as CheckDAMirrorPublication,
        verifyPointer,
        ethereumNode,
        log
      );
    default:
      return failure(ClaimableValidatorError.UNKNOWN);
  }
};

const txAlreadyChecked = async (
  txId: string,
  log: (message: string, ...optionalParams: any[]) => void
): PromiseWithContextResultOrNull<
  DAStructurePublication<DAEventType, PublicationTypedData> | void,
  DAStructurePublication<DAEventType, PublicationTypedData>
> => {
  // no need to recheck something already processed
  const dbResult = await getTxDb(txId);
  if (dbResult) {
    log('Already checked submission');
    if (dbResult.success) {
      return successWithContext(dbResult.dataAvailabilityResult);
    }

    return failureWithContext(
      (<TxValidatedFailureResult>dbResult).failureReason,
      dbResult.dataAvailabilityResult!
    );
  }

  return null;
};

const checkDAProofInternal = async (
  daPublication: DAStructurePublication<DAEventType, PublicationTypedData>,
  timestampProofs: DATimestampProofsResponse,
  ethereumNode: EthereumNode,
  { log, verifyPointer }: CheckDASubmissionOptions = {
    log: () => {},
    verifyPointer: true,
  }
): PromiseWithContextResult<
  DAStructurePublication<DAEventType, PublicationTypedData> | void,
  DAStructurePublication<DAEventType, PublicationTypedData>
> => {
  if (!daPublication.signature) {
    return failureWithContext(ClaimableValidatorError.NO_SIGNATURE_SUBMITTER, daPublication);
  }

  let signature = deepClone(daPublication.signature);

  // @ts-ignore
  delete daPublication.signature;

  // check if signature matches!
  const signedAddress = utils.verifyMessage(JSON.stringify(daPublication), signature);
  log('signedAddress', signedAddress);

  if (!isValidSubmitter(ethereumNode.environment, signedAddress, ethereumNode.deployment)) {
    return failureWithContext(ClaimableValidatorError.INVALID_SIGNATURE_SUBMITTER, daPublication);
  }

  // check if bundlr timestamp proofs are valid and verified against bundlr node
  // bundlr typings are Required<Proofs> but they are sharing the response and request
  const valid = await Utils.verifyReceipt(daPublication.timestampProofs.response as any);
  if (!valid) {
    log('timestamp proof invalid signature');
    return failureWithContext(
      ClaimableValidatorError.TIMESTAMP_PROOF_INVALID_SIGNATURE,
      daPublication
    );
  }

  log('timestamp proof signature valid');

  if (timestampProofs.type !== daPublication.type) {
    log('timestamp proof type mismatch');
    return failureWithContext(ClaimableValidatorError.TIMESTAMP_PROOF_INVALID_TYPE, daPublication);
  }

  if (timestampProofs.dataAvailabilityId !== daPublication.dataAvailabilityId) {
    log('timestamp proof da id mismatch');
    return failureWithContext(ClaimableValidatorError.TIMESTAMP_PROOF_INVALID_DA_ID, daPublication);
  }

  if (daPublication.event.timestamp !== daPublication.chainProofs.thisPublication.blockTimestamp) {
    log('event timestamp does not match the publication timestamp');
    // the event emitted must match the same timestamp as the block number
    return failureWithContext(ClaimableValidatorError.INVALID_EVENT_TIMESTAMP, daPublication);
  }

  if (
    daPublication.chainProofs.thisPublication.typedData.value.deadline !==
    daPublication.chainProofs.thisPublication.blockTimestamp
  ) {
    log('typed data timestamp does not match the publication timestamp');
    // the event emitted must match the same timestamp as the block number
    return failureWithContext(
      ClaimableValidatorError.INVALID_TYPED_DATA_DEADLINE_TIMESTAMP,
      daPublication
    );
  }

  log('event timestamp matches publication timestamp');

  const validateBlockResult = await validateChoosenBlock(
    daPublication.chainProofs.thisPublication.blockNumber,
    daPublication.timestampProofs.response.timestamp,
    ethereumNode,
    log
  );

  if (validateBlockResult.isFailure()) {
    return failureWithContext(validateBlockResult.failure!, daPublication);
  }

  log('event timestamp matches up the on chain block timestamp');

  const daResult = await checkDAPublication(daPublication, ethereumNode, { log, verifyPointer });
  if (daResult.isFailure()) {
    return failureWithContext(daResult.failure!, daPublication);
  }

  const generatedPublicationId = generatePublicationId(daPublication);
  if (generatedPublicationId !== daPublication.publicationId) {
    log('publicationId does not match the generated one');
    return failureWithContext(
      ClaimableValidatorError.GENERATED_PUBLICATION_ID_MISMATCH,
      daPublication
    );
  }

  return successWithContext(daPublication);
};

export const checkDAProofWithMetadata = async (
  txId: string,
  daPublicationWithTimestampProofs: DAPublicationWithTimestampProofsBatchResult,
  ethereumNode: EthereumNode,
  options: CheckDASubmissionOptions = {
    log: () => {},
    verifyPointer: true,
  }
): PromiseWithContextResult<
  DAStructurePublication<DAEventType, PublicationTypedData> | void,
  DAStructurePublication<DAEventType, PublicationTypedData>
> => {
  const alreadyChecked = await txAlreadyChecked(txId, options.log);
  if (alreadyChecked) {
    return alreadyChecked;
  }

  if (
    !isValidSubmitter(
      ethereumNode.environment,
      daPublicationWithTimestampProofs.submitter,
      ethereumNode.deployment
    )
  ) {
    console.log('invalid submitter', daPublicationWithTimestampProofs.submitter);
    return failureWithContext(
      ClaimableValidatorError.TIMESTAMP_PROOF_NOT_SUBMITTER,
      daPublicationWithTimestampProofs.daPublication
    );
  }

  return await checkDAProofInternal(
    daPublicationWithTimestampProofs.daPublication,
    daPublicationWithTimestampProofs.timestampProofsData,
    ethereumNode,
    options
  );
};

export const checkDAProof = async (
  txId: string,
  ethereumNode: EthereumNode,
  options: CheckDASubmissionOptions = {
    log: () => {},
    verifyPointer: true,
  }
): PromiseWithContextResult<
  DAStructurePublication<DAEventType, PublicationTypedData> | void,
  DAStructurePublication<DAEventType, PublicationTypedData>
> => {
  // pointers have the ar prefix!
  txId = txId.replace('ar://', '');

  options.log(`Checking the submission`);

  const alreadyChecked = await txAlreadyChecked(txId, options.log);
  if (alreadyChecked) {
    return alreadyChecked;
  }

  const cachedDAMetadata = await getTxDAMetadataDb(txId);

  const daPublication = cachedDAMetadata
    ? cachedDAMetadata
    : await getArweaveByIdAPI<DAStructurePublication<DAEventType, PublicationTypedData>>(txId);

  if (daPublication === null) {
    return failureWithContext(ClaimableValidatorError.INVALID_TX_ID, undefined as any);
  }

  if (daPublication === TIMEOUT_ERROR) {
    return failureWithContext(ClaimableValidatorError.CAN_NOT_CONNECT_TO_BUNDLR, undefined as any);
  }

  const cachedTimestampProofsMetadata = await getTxTimestampProofsMetadataDb(txId);

  const timestampProofsPayload = cachedTimestampProofsMetadata
    ? cachedTimestampProofsMetadata
    : await getArweaveByIdAPI<DATimestampProofsResponse>(daPublication.timestampProofs.response.id);

  if (timestampProofsPayload === null) {
    return failureWithContext(ClaimableValidatorError.INVALID_TX_ID, undefined as any);
  }

  if (timestampProofsPayload === TIMEOUT_ERROR) {
    return failureWithContext(ClaimableValidatorError.CAN_NOT_CONNECT_TO_BUNDLR, undefined as any);
  }

  // check the wallet who uploaded it is within the submittors wallet list
  const timestampProofsSubmitter = await isValidTransactionSubmitter(
    ethereumNode.environment,
    daPublication.timestampProofs.response.id,
    options.log,
    ethereumNode.deployment
  );

  if (timestampProofsSubmitter === TIMEOUT_ERROR) {
    return failureWithContext(ClaimableValidatorError.CAN_NOT_CONNECT_TO_BUNDLR, undefined as any);
  }

  if (!timestampProofsSubmitter) {
    options.log('timestamp proof invalid submitter');
    return failureWithContext(ClaimableValidatorError.TIMESTAMP_PROOF_NOT_SUBMITTER, daPublication);
  }

  options.log('timestamp proof valid submitter');

  return await checkDAProofInternal(daPublication, timestampProofsPayload, ethereumNode, options);
};
