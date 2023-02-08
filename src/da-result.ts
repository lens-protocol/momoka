import { ClaimableValidatorError } from './claimable-validator-errors';

export class DAResult<TSuccessResult> {
  constructor(public failure?: ClaimableValidatorError, public successResult?: TSuccessResult) {}

  public isSuccess(): boolean {
    return this.failure === undefined;
  }

  public isFailure(): boolean {
    return this.failure !== undefined;
  }
}

export type PromiseResult<TSuccessResult = void> = Promise<DAResult<TSuccessResult>>;
export type Result<TSuccessResult = void> = DAResult<TSuccessResult>;

export const success = <TResult = void>(result?: TResult): DAResult<TResult> =>
  new DAResult<TResult>(undefined, result);
export const failure = (failure: ClaimableValidatorError): DAResult<void> => new DAResult(failure);
