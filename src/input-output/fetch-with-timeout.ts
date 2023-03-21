import axios from 'axios';

export const fetchWithTimeout = async <TResponse>(url: string): Promise<TResponse | null> => {
  const response = await axios.get(url, {
    timeout: 5000,
  });

  return response.data as TResponse;
};
