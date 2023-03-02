export const TIMEOUT_ERROR = 'timeout';
export type TimeoutError = 'timeout';

export const fetchWithTimeout = async (
  url: RequestInfo,
  opts: RequestInit = {}
): Promise<Response> => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 2000);

  return fetch(url, {
    ...opts,
    signal: controller.signal,
  }).finally(() => {
    clearTimeout(id);
  });
};
