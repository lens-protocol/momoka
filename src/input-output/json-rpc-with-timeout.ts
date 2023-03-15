import gotRequest from 'got-cjs';
import https from 'https';

const PUBLIC_JSON_RPC_TIMEOUT = 5000;
const LOCAL_JSON_RPC_TIMEOUT = 500;

export const JSONRPCWithTimeout = async <TResponse>(
  url: string,
  request: { id: number; jsonrpc: string; method: string; params: unknown[] }
): Promise<TResponse> => {
  const timeout = url.includes(':8445') ? LOCAL_JSON_RPC_TIMEOUT : PUBLIC_JSON_RPC_TIMEOUT;
  if (typeof window === 'undefined') {
    const response = await gotRequest
      .post(url, {
        json: request,
        timeout: {
          request: timeout,
        },
        agent: {
          https: new https.Agent({ keepAlive: true }),
        },
      })
      .json<{ result: TResponse }>();

    return response.result;
  } else {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

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
