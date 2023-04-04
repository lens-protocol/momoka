import { DAProofsVerifier } from './da-proof-checker';
import { workerPool } from '../workers/worker-pool';
import { HandlerWorkers } from '../workers/handler-communication.worker';
import { deepClone } from '../common/helpers';
import {
  DAEventType,
  DAStructurePublication,
  PublicationTypedData,
} from '../data-availability-models/publications/data-availability-structure-publication';
import { Deployment, Environment } from '../common/environment';
import { LogFunctionType } from '../common/logger';
import { TIMEOUT_ERROR, TimeoutError } from '../input-output/common';
import { getOwnerOfTransactionAPI } from '../input-output/bundlr/get-owner-of-transaction.api';
import { isValidSubmitter } from '../submitters';
import { LibCurlProvider } from '../input-output/lib-curl-provider';

export class DaProofVerifier implements DAProofsVerifier {
  public extractAddress(
    daPublication: DAStructurePublication<DAEventType, PublicationTypedData>
  ): Promise<string> {
    const signature = deepClone(daPublication.signature);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // TODO: Is that important to remove signature from the shared object?
    delete daPublication.signature;

    return workerPool.execute<string>({
      worker: HandlerWorkers.EVM_VERIFY_MESSAGE,
      data: {
        daPublication,
        signature,
      },
    });
  }

  public verifyTimestampSignature(
    daPublication: DAStructurePublication<DAEventType, PublicationTypedData>
  ): Promise<boolean> {
    return workerPool.execute<boolean>({
      worker: HandlerWorkers.BUNDLR_VERIFY_RECEIPT,
      data: {
        bundlrUploadResponse: daPublication.timestampProofs.response,
      },
    });
  }

  public async verifyTransactionSubmitter(
    environment: Environment,
    txId: string,
    log: LogFunctionType,
    deployment?: Deployment
  ): Promise<boolean | TimeoutError> {
    const owner = await getOwnerOfTransactionAPI(txId, { provider: new LibCurlProvider() });
    if (owner === TIMEOUT_ERROR) {
      return TIMEOUT_ERROR;
    }

    log('owner result', owner);
    if (!owner) {
      return false;
    }

    return isValidSubmitter(environment, owner, deployment);
  }
}
