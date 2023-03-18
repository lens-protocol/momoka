import { curly } from 'node-libcurl';
import { isNativeNode } from '../common/helpers';

export const postWithTimeout = async <TResponse, TBody>(
  url: string,
  body: TBody
): Promise<TResponse> => {
  if (isNativeNode()) {
    const { statusCode, data } = await curly.post(url, {
      postFields: JSON.stringify(body),
      httpHeader: ['Content-Type: application/json'],
      timeout: 5000,
      curlyResponseBodyParser: false,
    });

    if (statusCode !== 200) {
      throw new Error(`postWithTimeout: ${statusCode}`);
    }

    return JSON.parse(data.toString()) as TResponse;
  } else {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 5000);

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
