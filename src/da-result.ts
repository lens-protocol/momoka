import { ClaimableValidatorError } from './claimable-validator-errors';

export class DAResult<TSuccessResult, TContext = undefined> {
  constructor(
    public failure?: ClaimableValidatorError,
    public successResult?: TSuccessResult,
    public context?: TContext
  ) {}

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

export type PromiseWithContextResult<TSuccessResult, TContext> = Promise<
  DAResult<TSuccessResult, TContext>
>;
export const failureWithContext = <TContext>(
  failure: ClaimableValidatorError,
  context: TContext
): DAResult<void, TContext> => new DAResult(failure, undefined, context);
export const successWithContext = <TResult>(result: TResult): DAResult<TResult, TResult> =>
  new DAResult(undefined, result, result);
