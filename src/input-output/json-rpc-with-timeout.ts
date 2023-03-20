import axios from 'axios';
import { curly } from 'node-libcurl';
import { isNativeNode } from '../common/helpers';
import { buildLensNodeFootprintLog, consoleWarn } from '../common/logger';
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
  if (isNativeNode()) {
    const { statusCode, data } = await curly.post(url, {
      postFields: JSON.stringify(request),
      httpHeader: ['Content-Type: application/json'],
      timeout: 5000,
      curlyResponseBodyParser: false,
    });

    if (statusCode !== 200) {
      if (statusCode === 429) {
        consoleWarn(
          buildLensNodeFootprintLog(
            'Please note that our syncing speed is limited by the rate at which your RPC node allows us to get data from them. Therefore, the process may take longer than expected due to the restrictions imposed by your node.'
          )
        );
      }

      throw new Error(`RPC error: ${statusCode}`);
    }

    const response = JSON.parse(data.toString());

    if (response.error) {
      consoleWarn(
        buildLensNodeFootprintLog(`Your RPC node is unstable - error ${response.error.message}`)
      );
      throw new Error(`NODE_RPC error - unstable: ${statusCode}`);
    }

    return response.result as TResponse;
  } else {
    const response = await axios.post(url, JSON.stringify(request), {
      timeout: 5000,
    });

    return response.data.result as TResponse;
  }
};
