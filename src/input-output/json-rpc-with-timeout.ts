import axios from 'axios';
import { curly } from 'node-libcurl';
import { isNativeNode } from '../common/helpers';
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
  if (isNativeNode()) {
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
    const response = await axios.post(url, JSON.stringify(request), {
      timeout: 5000,
    });

    return response.data.result as TResponse;
  }
};
