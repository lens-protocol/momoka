import { AxiosProvider } from '../client/axios-provider';
import { DATimestampProofsResponse } from '../data-availability-models/data-availability-timestamp-proofs';
import {
  DAEventType,
  DAStructurePublication,
  PublicationTypedData,
} from '../data-availability-models/publications/data-availability-structure-publication';
import { BlockInfo, EthereumNode, getBlock } from '../evm/ethereum';
import { getBundlrByIdAPI } from '../input-output/bundlr/get-bundlr-by-id.api';
import { TimeoutError } from '../input-output/common';
import {
  getBlockDb,
  getTxDAMetadataDb,
  getTxDb,
  getTxTimestampProofsMetadataDb,
  hasSignatureBeenUsedBeforeDb,
  saveBlockDb,
} from '../input-output/db';
import { TxValidatedResult } from '../input-output/tx-validated-results';
import { DAProofsGateway } from '../proofs/da-proof-checker';

export class DaProofGateway implements DAProofsGateway {
  public hasSignatureBeenUsedBefore(signature: string): Promise<boolean> {
    return hasSignatureBeenUsedBeforeDb(signature);
  }

  public getTxResultFromCache(txId: string): Promise<TxValidatedResult | null> {
    // Check if the transaction ID exists in the database
    return getTxDb(txId);
  }

  public getBlockRange(blockNumbers: number[], ethereumNode: EthereumNode): Promise<BlockInfo[]> {
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

  public async getDaPublication(
    txId: string
  ): Promise<DAStructurePublication<DAEventType, PublicationTypedData> | TimeoutError | null> {
    return (
      (await getTxDAMetadataDb(txId)) ||
      (await getBundlrByIdAPI<DAStructurePublication<DAEventType, PublicationTypedData>>(txId, {
        // use Axios for now as lib curl is causing some issues on different OS
        provider: new AxiosProvider(),
      }))
    );
  }

  public async getTimestampProofs(
    timestampId: string,
    txId: string
  ): Promise<DATimestampProofsResponse | TimeoutError | null> {
    return (
      (await getTxTimestampProofsMetadataDb(txId)) ||
      (await getBundlrByIdAPI<DATimestampProofsResponse>(timestampId, {
        // use Axios for now as lib curl is causing some issues on different OS
        provider: new AxiosProvider(),
      }))
    );
  }
}
