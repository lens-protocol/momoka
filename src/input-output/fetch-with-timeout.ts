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
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      signal: controller.signal,
    });

    clearTimeout(id);

    return await response.json();
  }
};
