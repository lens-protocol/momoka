import { curly } from 'node-libcurl';
import { JSONRPCMethods } from '../evm/jsonrpc-methods';

export const JSONRPCWithTimeout = async <TResponse>(
  url: string,
  method: JSONRPCMethods,
  params: unknown[]
): Promise<TResponse> => {
  const request = {
    id: 0,
    jsonrpc: '2.0',
    method,
    params,
  };
  if (typeof window === 'undefined') {
    const { statusCode, data } = await curly.post(url, {
      postFields: JSON.stringify(request),
      httpHeader: ['Content-Type: application/json'],
      timeout: 5000,
    });

    if (statusCode !== 200) {
      throw new Error(`JSONRPCWithTimeout: ${statusCode}`);
    }

    return data.result as TResponse;
  } else {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    clearTimeout(id);

    const blockchain = await response.json();
    return blockchain.result as TResponse;
  }
};
