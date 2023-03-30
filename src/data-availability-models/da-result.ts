import { ClaimableValidatorError } from './claimable-validator-errors';

class Success<TSuccess> {
  public constructor(public readonly successResult: TSuccess) {}

  public isSuccess(): this is Success<TSuccess> {
    return true;
  }

  public isFailure(): this is Failure<never, never> {
    return false;
  }
}

class Failure<TError, TContext = undefined> {
  public constructor(public readonly failure: TError, public context?: TContext) {}

  public isSuccess(): this is Success<never> {
    return false;
  }

  public isFailure(): this is Failure<TError, TContext> {
    return true;
  }
}

/**
 * Represents the result of a data availability check.
 * @template TSuccessResult The type of the successful result.
 * @template TContext The type of the context, which is undefined by default.
 */
export type DAResult<TSuccessResult, TContext = undefined> =
  | Success<TSuccessResult>
  | Failure<ClaimableValidatorError, TContext>;

/**
 * Represents a Promise of a data availability result.
 * @template TSuccessResult The type of the successful result.
 */
export type PromiseResult<TSuccessResult = void> = Promise<DAResult<TSuccessResult>>;

/**
 * Represents a data availability result.
 * @template TSuccessResult The type of the successful result.
 */
export type Result<TSuccessResult = void> = DAResult<TSuccessResult>;

/**
 * Creates a successful data availability result.
 * @template TResult The type of the successful result.
 * @param result The successful result.
 * @returns The successful data availability result.
 */
export function success(): Success<void>;
export function success<T>(result: T): Success<T>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any, prefer-arrow/prefer-arrow-functions
export function success<T>(result: any = undefined): Success<T> {
  return new Success(result);
}

/**
 * Creates a failed data availability result.
 * @param error The claimable validator error in case of failure.
 * @returns The failed data availability result.
 */
export const failure = (error: ClaimableValidatorError): Failure<ClaimableValidatorError> =>
  new Failure(error);

/**
 * Represents a Promise of a data availability result with context.
 * @template TSuccessResult The type of the successful result.
 * @template TContext The type of the context.
 */
export type PromiseWithContextResult<TSuccessResult, TContext> = Promise<
  DAResult<TSuccessResult, TContext>
>;

/**
 * Represents a Promise of a data availability result with optional context.
 * @template TSuccessResult The type of the successful result.
 * @template TContext The type of the context.
 */
export type PromiseWithContextResultOrNull<TSuccessResult, TContext> = Promise<DAResult<
  TSuccessResult,
  TContext
> | null>;

/**
 * Creates a failed data availability result with context.
 * @template TContext The type of the context.
 * @param error The claimable validator error in case of failure.
 * @param context The context associated with the result.
 * @returns The failed data availability result with context.
 */
export const failureWithContext = <TContext>(
  error: ClaimableValidatorError,
  context: TContext
): Failure<ClaimableValidatorError, TContext> => new Failure(error, context);
