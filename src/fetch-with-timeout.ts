import got from 'got-cjs';
// import https from 'https';
export const TIMEOUT_ERROR = 'timeout';
export type TimeoutError = 'timeout';

const TIMEOUT_MS = 20000;

export const fetchWithTimeout = async <TResponse>(url: string): Promise<TResponse> => {
  if (typeof window === 'undefined') {
    const response = await got
      .get(url, {
        timeout: {
          request: TIMEOUT_MS,
        },
        // agent: {
        //   https: new https.Agent({ keepAlive: true }),
        // },
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

export const postWithTimeout = async <TResponse, TBody>(
  url: string,
  body: TBody
): Promise<TResponse> => {
  if (typeof window === 'undefined') {
    const response: any = await got
      .post(url, {
        json: body,
        timeout: {
          request: TIMEOUT_MS,
        },
        // agent: {
        //   https: new https.Agent({ keepAlive: true }),
        // },
      })
      .json();

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

export const JSONRPCWithTimeout = async <TResponse>(
  url: string,
  request: { id: number; jsonrpc: string; method: string; params: any[] }
): Promise<TResponse> => {
  if (typeof window === 'undefined') {
    const response: any = await got
      .post(url, {
        json: request,
        timeout: {
          request: TIMEOUT_MS,
        },
        // agent: {
        //   https: new https.Agent({ keepAlive: true }),
        // },
      })
      .json();

    return response.result as TResponse;
  } else {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 10000);

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
