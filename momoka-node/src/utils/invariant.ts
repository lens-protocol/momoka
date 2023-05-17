export class InvariantError extends Error {
  constructor(message: string) {
    super(`InvariantError: ${message}`);
  }
}

type Invariant = (condition: unknown, message: string) => asserts condition;

/**
 * Asserts that the given condition is truthy
 *
 * @param condition - Either truthy or falsy value
 * @param message - An error message
 */
export const invariant: Invariant = (condition: unknown, message: string): asserts condition => {
  if (!condition) {
    throw new InvariantError(message);
  }
};
