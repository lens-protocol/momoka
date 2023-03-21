import { EthereumNode } from '../evm/ethereum';
import {
  CheckDASubmissionOptions,
  getDefaultCheckDASubmissionOptions,
} from '../proofs/models/check-da-submisson-options';
import { PromiseWithContextResult } from '../data-availability-models/da-result';
import {
  DAEventType,
  DAStructurePublication,
  PublicationTypedData,
} from '../data-availability-models/publications/data-availability-structure-publication';
import { ClientDaProofGateway } from './client-da-proof-gateway';
import { DaProofChecker } from '../proofs/da-proof-checker';
import { ClientDaProofVerifier } from './client-da-proof-verifier';

const gateway = new ClientDaProofGateway();
const verifier = new ClientDaProofVerifier();
const checker = new DaProofChecker(verifier, gateway);

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
