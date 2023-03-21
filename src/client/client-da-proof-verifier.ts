import { utils } from 'ethers';
import Arweave from 'arweave/web';
import deepHash from 'arweave/web/lib/deepHash';
import { b64UrlToBuffer } from 'arweave/web/lib/utils';

import {
  DAEventType,
  DAStructurePublication,
  PublicationTypedData,
} from '../data-availability-models/publications/data-availability-structure-publication';
import { deepClone } from '../common/helpers';
import { DAProofsVerifier } from '../proofs/da-proof-checker';
import { AxiosProvider } from './axios-provider';
import { Deployment, Environment } from '../common/environment';
import { LogFunctionType } from '../common/logger';
import { TimeoutError, TIMEOUT_ERROR } from '../input-output/common';
import { getOwnerOfTransactionAPI } from '../input-output/bundlr/get-owner-of-transaction.api';
import { isValidSubmitter } from '../submitters';
import { BundlrUploadResponse } from '../data-availability-models/data-availability-timestamp-proofs';

export const verifyReceipt = async ({
  deadlineHeight,
  id,
  public: pubKey,
  signature,
  timestamp,
  version,
}: BundlrUploadResponse): Promise<boolean> => {
  const dh = await deepHash([
    Arweave.utils.stringToBuffer('Bundlr'),
    Arweave.utils.stringToBuffer(version),
    Arweave.utils.stringToBuffer(id),
    Arweave.utils.stringToBuffer(deadlineHeight.toString()),
    Arweave.utils.stringToBuffer(timestamp.toString()),
  ]);
  return await Arweave.crypto.verify(pubKey, dh, b64UrlToBuffer(signature));
};

export class ClientDaProofVerifier implements DAProofsVerifier {
  extractAddress(
    daPublication: DAStructurePublication<DAEventType, PublicationTypedData>
  ): Promise<string> {
    const signature = deepClone(daPublication.signature);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // TODO: Is that important to remove signature from the shared object?
    delete daPublication.signature;

    return Promise.resolve(utils.verifyMessage(JSON.stringify(daPublication), signature));
  }

  verifyTimestampSignature(
    daPublication: DAStructurePublication<DAEventType, PublicationTypedData>
  ): Promise<boolean> {
    return verifyReceipt(daPublication.timestampProofs.response);
  }

  async verifyTransactionSubmitter(
    environment: Environment,
    txId: string,
    log: LogFunctionType,
    deployment?: Deployment
  ): Promise<boolean | TimeoutError> {
    const owner = await getOwnerOfTransactionAPI(txId, { provider: new AxiosProvider() });
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
