import { DATimestampProofsResponse } from '../data-availability-models/data-availability-timestamp-proofs';
import {
  DAEventType,
  DAStructurePublication,
  PublicationTypedData,
} from '../data-availability-models/publications/data-availability-structure-publication';
import { BlockInfo, EthereumNode, getBlock } from '../evm/ethereum';
import { TimeoutError } from '../input-output/common';
import { DAProofsGateway } from '../proofs/da-proof-checker';
import { getBundlrByIdAPI } from '../input-output/bundlr/get-bundlr-by-id.api';
import {
  getBlockDb,
  getTxDAMetadataDb,
  getTxDb,
  getTxTimestampProofsMetadataDb,
  saveBlockDb,
} from '../input-output/db';
import { TxValidatedResult } from '../input-output/tx-validated-results';
import { LibCurlProvider } from '../input-output/lib-curl-provider';

export class DaProofGateway implements DAProofsGateway {
  getTxResultFromCache(txId: string): Promise<TxValidatedResult | null> {
    // Check if the transaction ID exists in the database
    return getTxDb(txId);
  }

  getBlockRange(blockNumbers: number[], ethereumNode: EthereumNode): Promise<BlockInfo[]> {
    return Promise.all(
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
  }

  async getDaPublication(
    txId: string
  ): Promise<DAStructurePublication<DAEventType, PublicationTypedData> | TimeoutError | null> {
    return (
      (await getTxDAMetadataDb(txId)) ||
      (await getBundlrByIdAPI<DAStructurePublication<DAEventType, PublicationTypedData>>(txId, {
        provider: new LibCurlProvider(),
      }))
    );
  }

  async getTimestampProofs(
    timestampId: string,
    txId: string
  ): Promise<DATimestampProofsResponse | TimeoutError | null> {
    return (
      (await getTxTimestampProofsMetadataDb(txId)) ||
      (await getBundlrByIdAPI<DATimestampProofsResponse>(timestampId, {
        provider: new LibCurlProvider(),
      }))
    );
  }
}
