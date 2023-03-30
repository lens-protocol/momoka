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
import { TxValidatedResult } from '../input-output/tx-validated-results';
import { AxiosProvider } from './axios-provider';

export class ClientDaProofGateway implements DAProofsGateway {
  getBlockRange(blockNumbers: number[], ethereumNode: EthereumNode): Promise<BlockInfo[]> {
    return Promise.all(blockNumbers.map((blockNumber) => getBlock(blockNumber, ethereumNode)));
  }

  getDaPublication(
    txId: string
  ): Promise<DAStructurePublication<DAEventType, PublicationTypedData> | TimeoutError | null> {
    return getBundlrByIdAPI<DAStructurePublication<DAEventType, PublicationTypedData>>(txId, {
      provider: new AxiosProvider(),
    });
  }

  getTimestampProofs(
    timestampId: string
  ): Promise<DATimestampProofsResponse | TimeoutError | null> {
    return getBundlrByIdAPI<DATimestampProofsResponse>(timestampId, {
      provider: new AxiosProvider(),
    });
  }

  // No cache available in the client
  getTxResultFromCache(): Promise<TxValidatedResult | null> {
    return Promise.resolve(null);
  }
}
