export interface FetchProvider {
  get: <TResponse>(url: string, options: { timeout: number }) => Promise<TResponse>;
}

export const fetchWithTimeout = <TResponse>(
  url: string,
  { provider }: { provider: FetchProvider }
): Promise<TResponse | null> => {
  return provider.get<TResponse>(url, { timeout: 5000 });
};
