import axios from 'axios';
import { JSONRPCMethods } from '../evm/jsonrpc-methods';

// most RPC nodes rate limits is per second!
export const RATE_LIMIT_TIME = 1000;

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

  const response = await axios.post(url, JSON.stringify(request), {
    timeout: 5000,
  });

  return response.data.result as TResponse;
};
