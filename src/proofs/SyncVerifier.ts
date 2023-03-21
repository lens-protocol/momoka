import Utils from '@bundlr-network/client/build/common/utils';
import { utils } from 'ethers';

import { DAProofsVerifier } from './DAProofChecker';
import {
  DAEventType,
  DAStructurePublication,
  PublicationTypedData,
} from '../data-availability-models/publications/data-availability-structure-publication';
import { deepClone } from '../common/helpers';

export class SyncVerifier implements DAProofsVerifier {
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
    // TODO: Understand why tsc fails
    return Utils.verifyReceipt(daPublication.timestampProofs.response as any);
  }
}
