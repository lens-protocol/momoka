import { EthereumNode } from '../evm/ethereum';
import {
  CheckDASubmissionOptions,
  getDefaultCheckDASubmissionOptions,
} from './models/check-da-submisson-options';
import { PromiseWithContextResult } from '../data-availability-models/da-result';
import {
  DAEventType,
  DAStructurePublication,
  PublicationTypedData,
} from '../data-availability-models/publications/data-availability-structure-publication';
import { DAProofGateway } from './DAProofGateway';
import { SyncVerifier } from './SyncVerifier';
import { DAProofChecker } from './DAProofChecker';

const gateway = new DAProofGateway();
const verifier = new SyncVerifier();
const checker = new DAProofChecker(verifier, gateway);

export const checkDAProof = (
  txId: string,
  ethereumNode: EthereumNode,
  options: CheckDASubmissionOptions = getDefaultCheckDASubmissionOptions
): PromiseWithContextResult<
  DAStructurePublication<DAEventType, PublicationTypedData> | void,
  DAStructurePublication<DAEventType, PublicationTypedData>
> => {
  return checker.checkDAProof(txId, ethereumNode, options);
};
