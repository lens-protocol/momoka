import Utils from '@bundlr-network/client/build/common/utils';
import { utils } from 'ethers';
import { deepClone } from '../common/helpers';
import { LogFunctionType } from '../common/logger';
import { ClaimableValidatorError } from '../data-availability-models/claimable-validator-errors';
import {
  failure,
  failureWithContext,
  PromiseResult,
  PromiseWithContextResult,
  PromiseWithContextResultOrNull,
  success,
  successWithContext,
} from '../data-availability-models/da-result';
import { DAActionTypes } from '../data-availability-models/data-availability-action-types';
import {
  DAPublicationWithTimestampProofsBatchResult,
  DATimestampProofsResponse,
} from '../data-availability-models/data-availability-timestamp-proofs';
import {
  DAEventType,
  DAStructurePublication,
  PublicationTypedData,
} from '../data-availability-models/publications/data-availability-structure-publication';
import { BlockInfo, EthereumNode, getBlock } from '../evm/ethereum';
import { getArweaveByIdAPI } from '../input-output/arweave/get-arweave-by-id.api';
import { TIMEOUT_ERROR } from '../input-output/common';
import {
  getBlockDb,
  getTxDAMetadataDb,
  getTxDb,
  getTxTimestampProofsMetadataDb,
  saveBlockDb,
  TxValidatedFailureResult,
} from '../input-output/db';
import { isValidSubmitter, isValidTransactionSubmitter } from '../submitters';
import { CheckDASubmissionOptions } from './models/check-da-submisson-options';
import { checkDAComment, CheckDACommentPublication } from './publications/comment';
import { checkDAMirror, CheckDAMirrorPublication } from './publications/mirror';
import { checkDAPost, CheckDAPostPublication } from './publications/post';

/**
 * Finds the closest block based on timestamp in milliseconds.
 * @param blocks List of blocks to search through
 * @param timestamp Timestamp in milliseconds to match against block timestamp
 * @returns The block with the closest matching timestamp
 */
const getClosestBlock = (blocks: BlockInfo[], timestamp: number): BlockInfo => {
  return blocks
    .map((c) => ({
      ...c,
      // Convert block timestamp to milliseconds
      timestamp: c.timestamp * 1000,
    }))
    .filter((c) => timestamp >= c.timestamp)
    .reduce((prev, curr) => {
      return Math.abs(curr.timestamp - timestamp) < Math.abs(prev.timestamp - timestamp)
        ? curr
        : prev;
    });
};

/**
 * Retrieves block information for a range of block numbers.
 * If a block has been retrieved previously, it will return the cached value instead of querying the network.
 * Any newly retrieved blocks will be cached for future use.
 * @param blockNumbers An array of block numbers to retrieve information for
 * @param ethereumNode The Ethereum node to query for block information
 * @returns A PromiseResult containing an array of BlockInfo objects, or a TimeoutError if the query times out
 */
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

/**
 * Validate if a block number is the closest one to a given timestamp.
 * @param blockNumber - The block number to be validated.
 * @param timestamp - The timestamp to be used to validate the block.
 * @param ethereumNode - The Ethereum node to be used for block validation.
 * @param log - The log function used to log debug information.
 * @returns A PromiseResult containing a success result if the block is validated, or a failure with the corresponding error.
 */
const validateChoosenBlock = async (
  blockNumber: number,
  timestamp: number,
  ethereumNode: EthereumNode,
  log: LogFunctionType
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

/**
 * Generates the unique ID for a DAStructurePublication.
 * @param daPublication The DAStructurePublication to generate an ID for
 */
const generatePublicationId = (
  daPublication: DAStructurePublication<DAEventType, PublicationTypedData>
): string => {
  return `${daPublication.event.profileId}-${daPublication.event.pubId}-DA-${
    daPublication.dataAvailabilityId.split('-')[0]
  }`;
};

/**
 * Validates a publication of a DA structure by checking its type and calling the appropriate check function.
 * @param daPublication The publication to validate.
 * @param ethereumNode The Ethereum node to use for validation.
 * @param checkOptions Options for checking the publication.
 * @returns A PromiseResult indicating the success or failure of the publication check.
 */
const checkDAPublication = async (
  daPublication: DAStructurePublication<DAEventType, PublicationTypedData>,
  ethereumNode: EthereumNode,
  checkOptions: CheckDASubmissionOptions
): PromiseResult => {
  switch (daPublication.type) {
    case DAActionTypes.POST_CREATED:
      if (daPublication.chainProofs.pointer) {
        return failure(ClaimableValidatorError.INVALID_POINTER_SET_NOT_NEEDED);
      }
      return await checkDAPost(
        daPublication as CheckDAPostPublication,
        ethereumNode,
        checkOptions.log
      );
    case DAActionTypes.COMMENT_CREATED:
      return await checkDAComment(
        daPublication as CheckDACommentPublication,
        checkOptions.verifyPointer,
        ethereumNode,
        checkOptions.log
      );
    case DAActionTypes.MIRROR_CREATED:
      return await checkDAMirror(
        daPublication as CheckDAMirrorPublication,
        checkOptions.verifyPointer,
        ethereumNode,
        checkOptions.log
      );
    default:
      return failure(ClaimableValidatorError.UNKNOWN);
  }
};

/**
 * Checks if the given transaction ID has already been checked and returns the corresponding publication.
 * If the transaction ID is found in the database, returns either a success or failure result depending on whether the
 * publication was validated successfully or not, respectively.
 * If the transaction ID is not found in the database, returns null.
 * @param txId The transaction ID to check
 * @param log The logging function to use
 * @returns A promise that resolves to a success or failure result if the publication has already been checked, or null otherwise.
 */
const txAlreadyChecked = async (
  txId: string,
  log: LogFunctionType
): PromiseWithContextResultOrNull<
  DAStructurePublication<DAEventType, PublicationTypedData> | void,
  DAStructurePublication<DAEventType, PublicationTypedData>
> => {
  // Check if the transaction ID exists in the database
  const dbResult = await getTxDb(txId);

  if (dbResult) {
    // If the transaction ID is found, log a message and return the corresponding publication
    log('Already checked submission');

    if (dbResult.success) {
      return successWithContext(dbResult.dataAvailabilityResult);
    }

    return failureWithContext(
      (<TxValidatedFailureResult>dbResult).failureReason,
      dbResult.dataAvailabilityResult!
    );
  }

  // If the transaction ID is not found, return null
  return null;
};

const validResult = 'valid';
type ValidType = 'valid';

/**
 * Validates the timestamp proof of the given DA publication against the corresponding timestamp proof payload.
 * @param daPublication The DA publication to validate the timestamp proof of.
 * @param timestampProofs The timestamp proof payload to validate the DA publication against.
 * @param log A logging function to output debug information.
 * @returns A Promise that resolves with a `ValidType` if the timestamp proof is valid or an error code if it is not.
 */
const validatesTimestampProof = async (
  daPublication: DAStructurePublication<DAEventType, PublicationTypedData>,
  timestampProofs: DATimestampProofsResponse,
  log: LogFunctionType
): Promise<
  | ClaimableValidatorError.TIMESTAMP_PROOF_INVALID_SIGNATURE
  | ClaimableValidatorError.TIMESTAMP_PROOF_INVALID_TYPE
  | ClaimableValidatorError.TIMESTAMP_PROOF_INVALID_DA_ID
  | ValidType
> => {
  // check if bundlr timestamp proofs are valid and verified against bundlr node
  // bundlr typings are Required<Proofs> but they are sharing the response and request
  const valid = await Utils.verifyReceipt(daPublication.timestampProofs.response as any);
  if (!valid) {
    log('timestamp proof invalid signature');
    return ClaimableValidatorError.TIMESTAMP_PROOF_INVALID_SIGNATURE;
  }

  log('timestamp proof signature valid');

  if (timestampProofs.type !== daPublication.type) {
    log('timestamp proof type mismatch');
    return ClaimableValidatorError.TIMESTAMP_PROOF_INVALID_TYPE;
  }

  if (timestampProofs.dataAvailabilityId !== daPublication.dataAvailabilityId) {
    log('timestamp proof da id mismatch');
    return ClaimableValidatorError.TIMESTAMP_PROOF_INVALID_DA_ID;
  }

  return validResult;
};

/**
 * Checks if the event timestamp in the given DA publication matches the publication timestamp of the block it was included in.
 * @param daPublication The DA publication to check.
 * @returns A boolean indicating whether or not the event timestamp matches the publication timestamp.
 */
const isValidEventTimestamp = (
  daPublication: DAStructurePublication<DAEventType, PublicationTypedData>
): boolean => {
  return daPublication.event.timestamp === daPublication.chainProofs.thisPublication.blockTimestamp;
};

/**
 * Checks if the typed data deadline timestamp in the given DAStructurePublication matches
 * the block timestamp of the containing block.
 * @param daPublication The DAStructurePublication to check.
 * @returns True if the typed data deadline timestamp matches the block timestamp, false otherwise.
 */
const isValidTypedDataDeadlineTimestamp = (
  daPublication: DAStructurePublication<DAEventType, PublicationTypedData>
): boolean => {
  return (
    daPublication.chainProofs.thisPublication.typedData.value.deadline ===
    daPublication.chainProofs.thisPublication.blockTimestamp
  );
};

/**
 * Checks if the publication id generated from the given DAStructurePublication matches the publication id of the same
 * DAStructurePublication.
 * @param daPublication The DAStructurePublication to validate.
 * @returns true if the generated publication id matches the publication id of the given DAStructurePublication.
 */
export const isValidPublicationId = (
  daPublication: DAStructurePublication<DAEventType, PublicationTypedData>
): boolean => {
  const generatedPublicationId = generatePublicationId(daPublication);

  return generatedPublicationId === daPublication.publicationId;
};

/**
 * Checks if the signature submitter is valid.
 * @param daPublication - The publication to check.
 * @param ethereumNode - The Ethereum node to use.
 * @param log - The logging function to use.
 * @returns True if the signature submitter is valid, false otherwise.
 */
export const isValidSignatureSubmitter = (
  daPublication: DAStructurePublication<DAEventType, PublicationTypedData>,
  ethereumNode: EthereumNode,
  log: LogFunctionType
): boolean => {
  const signature = deepClone(daPublication.signature);

  // @ts-ignore
  delete daPublication.signature;

  // check if signature matches!
  const signedAddress = utils.verifyMessage(JSON.stringify(daPublication), signature);
  log('signedAddress', signedAddress);

  if (!isValidSubmitter(ethereumNode.environment, signedAddress, ethereumNode.deployment)) {
    return false;
  }

  return true;
};

/**
 * Validates the timestamp proofs and signatures of a given publication
 * against the timestampProofs and ethereumNode parameters.
 * @param daPublication The publication to validate.
 * @param timestampProofs The timestamp proofs to validate the publication against.
 * @param ethereumNode The Ethereum node to validate the publication against.
 * @param options The optional parameters to use when checking the publication.
 * @returns A promise with the result of the validation.
 */
const _checkDAProof = async (
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

  if (!isValidSignatureSubmitter(daPublication, ethereumNode, log)) {
    return failureWithContext(ClaimableValidatorError.INVALID_SIGNATURE_SUBMITTER, daPublication);
  }

  const timestampProofsResult = await validatesTimestampProof(daPublication, timestampProofs, log);
  if (timestampProofsResult !== validResult) {
    return failureWithContext(timestampProofsResult, daPublication);
  }

  if (!isValidEventTimestamp(daPublication)) {
    log('event timestamp does not match the publication timestamp');
    // the event emitted must match the same timestamp as the block number
    return failureWithContext(ClaimableValidatorError.INVALID_EVENT_TIMESTAMP, daPublication);
  }

  if (!isValidTypedDataDeadlineTimestamp(daPublication)) {
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

  if (!isValidPublicationId(daPublication)) {
    log('publicationId does not match the generated one');
    return failureWithContext(
      ClaimableValidatorError.GENERATED_PUBLICATION_ID_MISMATCH,
      daPublication
    );
  }

  return successWithContext(daPublication);
};

/**
 * Checks a data availability proof with metadata, including the timestamp proofs and transaction ID.
 * If the proof has already been checked, returns the previous result.
 * If the submitter is invalid, returns an error.
 * Otherwise, runs the internal proof check and returns the result.
 * @param txId The transaction ID associated with the proof.
 * @param daPublicationWithTimestampProofs The data availability publication with associated timestamp proofs.
 * @param ethereumNode The Ethereum node to use for validation.
 * @param options Optional options for the check, including logging and pointer verification.
 * @returns A context result with the validated publication, or an error if validation fails.
 */
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

  return await _checkDAProof(
    daPublicationWithTimestampProofs.daPublication,
    daPublicationWithTimestampProofs.timestampProofsData,
    ethereumNode,
    options
  );
};

/**
 * Validates a data availability proof of a given transaction on the Arweave network, including the timestamp proofs.
 * @param txId The transaction ID to check.
 * @param ethereumNode The Ethereum node to use to validate the data availability proof.
 * @param options The options for validating the data availability proof.
 * @returns A `Promise` that resolves to a `PromiseResult` containing the validated data availability proof, or `void` if the validation fails.
 */
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
  txId = txId.replace('ar://', ''); // pointers have the ar prefix!

  options.log(`Checking the submission`);

  const alreadyChecked = await txAlreadyChecked(txId, options.log);
  if (alreadyChecked) return alreadyChecked;

  const daPublication =
    (await getTxDAMetadataDb(txId)) ||
    (await getArweaveByIdAPI<DAStructurePublication<DAEventType, PublicationTypedData>>(txId));
  if (!daPublication) {
    return failureWithContext(ClaimableValidatorError.INVALID_TX_ID, undefined as any);
  }
  if (daPublication === TIMEOUT_ERROR) {
    return failureWithContext(ClaimableValidatorError.CAN_NOT_CONNECT_TO_BUNDLR, undefined as any);
  }

  const timestampProofsPayload =
    (await getTxTimestampProofsMetadataDb(txId)) ||
    (await getArweaveByIdAPI<DATimestampProofsResponse>(daPublication.timestampProofs.response.id));
  if (!timestampProofsPayload) {
    return failureWithContext(ClaimableValidatorError.INVALID_TX_ID, undefined as any);
  }
  if (timestampProofsPayload === TIMEOUT_ERROR) {
    return failureWithContext(ClaimableValidatorError.CAN_NOT_CONNECT_TO_BUNDLR, undefined as any);
  }

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
    return failureWithContext(ClaimableValidatorError.TIMESTAMP_PROOF_NOT_SUBMITTER, daPublication);
  }
  options.log('timestamp proof valid submitter');

  return await _checkDAProof(daPublication, timestampProofsPayload, ethereumNode, options);
};
