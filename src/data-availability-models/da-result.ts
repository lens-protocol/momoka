import { ClaimableValidatorError } from './claimable-validator-errors';

/**
 * Represents the result of a data availability check.
 * @template TSuccessResult The type of the successful result.
 * @template TContext The type of the context, which is undefined by default.
 */
export class DAResult<TSuccessResult, TContext = undefined> {
  /**
   * Initializes a new instance of the `DAResult` class.
   * @param failure The claimable validator error in case of failure.
   * @param successResult The successful result.
   * @param context The context associated with the result.
   */
  constructor(
    public failure?: ClaimableValidatorError,
    public successResult?: TSuccessResult,
    public context?: TContext
  ) {}

  /**
   * Determines whether the data availability check is successful.
   * @returns `true` if the check is successful; otherwise, `false`.
   */
  public isSuccess(): boolean {
    return this.failure === undefined;
  }

  /**
   * Determines whether the data availability check is a failure.
   * @returns `true` if the check is a failure; otherwise, `false`.
   */
  public isFailure(): boolean {
    return this.failure !== undefined;
  }
}

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
export const success = <TResult = void>(result?: TResult): DAResult<TResult> =>
  new DAResult<TResult>(undefined, result);

/**
 * Creates a failed data availability result.
 * @param failure The claimable validator error in case of failure.
 * @returns The failed data availability result.
 */
export const failure = (error: ClaimableValidatorError): DAResult<void> => new DAResult(error);

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
 * @param failure The claimable validator error in case of failure.
 * @param context The context associated with the result.
 * @returns The failed data availability result with context.
 */
export const failureWithContext = <TContext>(
  error: ClaimableValidatorError,
  context: TContext
): DAResult<void, TContext> => new DAResult(error, undefined, context);

/**
 * Creates a successful data availability result with context.
 * @template TResult The type of the successful result.
 * @param result The successful result.
 * @returns The successful data availability result with context.
 */
export const successWithContext = <TResult>(result: TResult): DAResult<TResult, TResult> =>
  new DAResult(undefined, result, result);
