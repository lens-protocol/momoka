import { ClaimableValidatorError } from '../data-availability-models/claimable-validator-errors';
import {
  DAEventType,
  DAStructurePublication,
  PublicationTypedData,
} from '../data-availability-models/publications/data-availability-structure-publication';

export type TxValidatedResult = TxValidatedFailureResult | TxValidatedSuccessResult;

interface TxValidatedResultBase<TSuccess extends boolean, TDAStructurePublication> {
  proofTxId: string;
  success: TSuccess;
  dataAvailabilityResult: TDAStructurePublication;
}

export interface TxValidatedFailureResult
  extends TxValidatedResultBase<
    false,
    DAStructurePublication<DAEventType, PublicationTypedData> | undefined
  > {
  failureReason: ClaimableValidatorError;
  extraErrorInfo?: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TxValidatedSuccessResult
  extends TxValidatedResultBase<true, DAStructurePublication<DAEventType, PublicationTypedData>> {}
