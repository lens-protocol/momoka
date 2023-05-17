import { utils } from 'ethers';
import {
  DAEventType,
  DAStructurePublication,
  PublicationTypedData,
} from '../../data-availability-models/publications/data-availability-structure-publication';

export interface EVMVerifyMessageWorkerRequest {
  daPublication: DAStructurePublication<DAEventType, PublicationTypedData>;
  signature: string;
}

/**
 *  Verifies the signature of a message
 * @param request - The request to verify the signature of a message
 */
export const evmVerifyMessageWorker = (request: EVMVerifyMessageWorkerRequest): string => {
  return utils.verifyMessage(JSON.stringify(request.daPublication), request.signature);
};
