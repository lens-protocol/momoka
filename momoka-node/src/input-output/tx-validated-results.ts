import {
  DAEventType,
  DAStructurePublication,
  PublicationTypedData,
} from '../data-availability-models/publications/data-availability-structure-publication';
import { MomokaValidatorError } from '../data-availability-models/validator-errors';

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
  failureReason: MomokaValidatorError;
  extraErrorInfo?: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TxValidatedSuccessResult
  extends TxValidatedResultBase<true, DAStructurePublication<DAEventType, PublicationTypedData>> {}
