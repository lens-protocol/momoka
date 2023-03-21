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
import { ClientDAProofGateway } from './ClientDAProofGateway';
import { DAProofChecker } from '../proofs/DAProofChecker';
import { ClientDAPProofVerifier } from './ClientDAPProofVerifier';

const gateway = new ClientDAProofGateway();
const verifier = new ClientDAPProofVerifier();
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
