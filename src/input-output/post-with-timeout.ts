import axios from 'axios';
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
      throw new Error(`postWithTimeout: ${statusCode} - ${data.toString()}`);
    }

    return JSON.parse(data.toString()) as TResponse;
  } else {
    const response = await axios.post(url, JSON.stringify(body), {
      timeout: 5000,
    });

    return response.data as TResponse;
  }
};
