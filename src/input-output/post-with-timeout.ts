import { curly } from 'node-libcurl';

export const postWithTimeout = async <TResponse, TBody>(
  url: string,
  body: TBody
): Promise<TResponse> => {
  const { statusCode, data } = await curly.post(url, {
    postFields: JSON.stringify(body),
    httpHeader: ['Content-Type: application/json'],
    timeout: 5000,
    curlyResponseBodyParser: false,
  });

  if (statusCode !== 200) {
    throw new Error(`postWithTimeout: ${statusCode} - ${data.toString()}`);
  }

  return JSON.parse(data.toString()) as TResponse;
};
