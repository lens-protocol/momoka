/**
 * Creates a deep clone of the given object by converting it to a JSON string and then parsing it back to an object.
 * @param object - The object to clone.
 * @returns The cloned object.
 */
export const deepClone = <T>(object: T): T => {
  return JSON.parse(JSON.stringify(object)) as T;
};

/**
 * Asynchronously sleeps for the given number of milliseconds.
 * @param milliseconds - The number of milliseconds to sleep.
 * @returns A Promise that resolves after the given number of milliseconds have elapsed.
 */
export const sleep = (milliseconds: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

/**
 * Gets the value of the specified environment variable or exits the process if it is not defined.
 * @param name - The name of the environment variable to retrieve.
 * @returns The value of the specified environment variable.
 */
export const getParamOrExit = (name: string): string => {
  const param = process.env[name];
  if (!param) {
    console.error(`Required config param '${name}' missing`);
    process.exit(1);
  }
  return param;
};

/**
 * Gets the value of the specified environment variable or returns null if it is not defined.
 * @param name - The name of the environment variable to retrieve.
 * @returns The value of the specified environment variable or null if it is not defined.
 */
export const getParam = (name: string): string | null => {
  const param = process.env[name];
  if (!param) {
    return null;
  }
  return param;
};

/**
 * Converts a base64-encoded string to a JSON object.
 * @param base64String - The base64-encoded string to convert.
 * @returns The resulting JSON object.
 */
export const base64StringToJson = <T>(base64String: string): T => {
  const buffer = Buffer.from(base64String, 'base64');
  const jsonString = buffer.toString('utf-8');
  return JSON.parse(jsonString) as T;
};

/**
 * Converts a Unix timestamp to a JavaScript Date object represented in milliseconds.
 * @param unixTimestamp - The Unix timestamp to convert.
 * @returns The resulting timestamp in milliseconds.
 */
export const unixTimestampToMilliseconds = (unixTimestamp: number): number => unixTimestamp * 1000;

/**
 * Pads a number to the left with zeroes.
 * @param nr - The number to pad.
 * @param len - The desired length of the resulting string (default: 2).
 * @param chr - The character to use for padding (default: '0').
 * @returns The resulting padded string.
 */
const padLeft = (nr: number, len = 2, chr = `0`): string => `${nr}`.padStart(len, chr);

/**
 * Formats a JavaScript Date object as a human-readable string.
 * @param date - The Date object to format.
 * @returns The formatted date string.
 */
export const formatDate = (date: Date): string => {
  return `${padLeft(date.getMonth() + 1)}/${padLeft(
    date.getDate()
  )}/${date.getFullYear()} ${padLeft(date.getHours())}:${padLeft(date.getMinutes())}:${padLeft(
    date.getSeconds()
  )}`;
};

/**
 *  Split arrays up into smaller chunks
 * @param arr The array to chunk
 * @param size The size of the chunks
 */
export const chunkArray = <T>(arr: T[], size: number): T[][] =>
  arr.length > size ? [arr.slice(0, size), ...chunkArray(arr.slice(size), size)] : [arr];

/**
 *  Create a promise that will timeout after the given number of milliseconds
 * @param timeout The number of milliseconds to wait before timing out
 */
export const createTimeoutPromise = (
  timeout: number
): {
  promise: Promise<void>;
  timeoutId: NodeJS.Timeout;
} => {
  const timeoutIdWrapper = { timeoutId: setTimeout(() => {}, 0) }; // Initialize with an empty function
  clearTimeout(timeoutIdWrapper.timeoutId); // Clear the initial timeout

  const promise = new Promise<void>((_, reject) => {
    timeoutIdWrapper.timeoutId = setTimeout(() => reject(new Error('Timeout exceeded')), timeout);
  });

  return { promise, timeoutId: timeoutIdWrapper.timeoutId };
};

/**
 *  Return if the processing doing this is native node and not a browser
 */
export const isNativeNode = (): boolean => {
  return typeof window === 'undefined';
};

type AsyncFunction<T> = () => Promise<T>;

export interface RetryWithTimeoutOptions {
  delayMs?: number;
  maxRetries?: number;
}

/**
 *  Retry a function with a timeout between retries
 * @param fn The function
 * @param options The options like delay and max retries
 */
export const retryWithTimeout = async <T>(
  fn: AsyncFunction<T>,
  options: RetryWithTimeoutOptions = {}
): Promise<T> => {
  let attempt = 0;

  const maxRetries = options.maxRetries || 10;
  const delayMs = options.delayMs || 100;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      return await fn();
    } catch (error) {
      if (attempt <= maxRetries) {
        await sleep(delayMs);
        attempt++;
      } else {
        throw error;
      }
    }
  }
};

/**
 * Simple abstraction to run a function forever
 * @param fn
 */
export const runForever = async (
  fn: AsyncFunction<void>,
  sleepAfterEach: number | undefined = undefined
): Promise<never> => {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    await fn();
    if (sleepAfterEach) {
      await sleep(sleepAfterEach);
    }
  }
};

/**
 * node please stop saying fetch is experimental - we know and we are not even using it :)
 */
export const turnedOffExperimentalWarning = (): void => {
  // node please stop saying fetch is experimental - we know and we are not even using it :)
  const warningListeners = process.listeners('warning');
  if (warningListeners.length != 1) {
    console.warn(
      `expected 1 listener on the process "warning" event, saw ${warningListeners.length}`
    );
  }

  if (warningListeners[0]) {
    const originalWarningListener = warningListeners[0];
    process.removeAllListeners('warning');

    process.prependListener('warning', (warning) => {
      if (warning.name != 'ExperimentalWarning') {
        originalWarningListener(warning);
      }
    });
  }
};
