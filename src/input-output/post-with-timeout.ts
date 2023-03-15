import gotRequest from 'got-cjs';
import https from 'https';
import { TIMEOUT_MS } from './common';

export const postWithTimeout = async <TResponse, TBody>(
  url: string,
  body: TBody
): Promise<TResponse> => {
  if (typeof window === 'undefined') {
    const response = await gotRequest
      .post(url, {
        json: body,
        timeout: {
          request: TIMEOUT_MS,
        },
        agent: {
          https: new https.Agent({ keepAlive: true }),
        },
      })
      .json<TResponse>();

    return response as TResponse;
  } else {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(id);

    const blockchain = await response.json();
    return blockchain.result as TResponse;
  }
};
