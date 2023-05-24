import axios from 'axios';

export const postWithTimeout = async <TResponse, TBody>(
  url: string,
  body: TBody
): Promise<TResponse> => {
  const { status, data } = await axios.post(url, body, {
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 5000,
  });

  if (status !== 200) {
    throw new Error(`postWithTimeout: ${status} - ${data.toString()}`);
  }

  return data as TResponse;
};
