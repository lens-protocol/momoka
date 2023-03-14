import got from 'got-cjs';
import https from 'https';
import { TIMEOUT_MS } from './common';

export const fetchWithTimeout = async <TResponse>(url: string): Promise<TResponse> => {
  if (typeof window === 'undefined') {
    const response = await got
      .get(url, {
        timeout: {
          request: TIMEOUT_MS,
        },
        agent: {
          https: new https.Agent({ keepAlive: true }),
        },
      })
      .json();

    return response as TResponse;
  } else {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      signal: controller.signal,
    });

    clearTimeout(id);

    return await response.json();
  }
};
