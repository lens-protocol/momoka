import axios from 'axios';
import { FetchProvider } from '../input-output/fetch-with-timeout';

export class AxiosProvider implements FetchProvider {
  async get<TResponse>(url: string, { timeout }: { timeout: number }): Promise<TResponse> {
    const response = await axios.get(url, {
      timeout,
    });

    return response.data as TResponse;
  }
}
