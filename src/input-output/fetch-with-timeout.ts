import axios from 'axios';
import { curly } from 'node-libcurl';
import { isNativeNode } from '../common/helpers';

export const fetchWithTimeout = async <TResponse>(url: string): Promise<TResponse | null> => {
  if (isNativeNode()) {
    const { statusCode, data } = await curly.get(url, {
      httpHeader: ['Content-Type: application/json'],
      curlyResponseBodyParser: false,
      timeout: 5000,
    });

    if (statusCode !== 200) {
      return null;
    }

    return JSON.parse(data.toString()) as TResponse;
  } else {
    const response = await axios.get(url, {
      timeout: 5000,
    });

    return response.data as TResponse;
  }
};
