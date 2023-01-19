import { ClaimableValidatorError } from './claimable-validator-errors';

class DAResult {
  constructor(public failure?: ClaimableValidatorError) {}

  public isSuccess(): boolean {
    return this.failure === undefined;
  }

  public isFailure(): boolean {
    return this.failure !== undefined;
  }
}

export type PromiseResult = Promise<DAResult>;
export type Result = DAResult;

export const success = (): Result => new DAResult();
export const failure = (failure: ClaimableValidatorError): DAResult => new DAResult(failure);
