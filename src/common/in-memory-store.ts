export class InMemoryStore {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private state: Map<string, any>;

  constructor() {
    this.state = new Map<string, unknown>();
  }

  public set<T>(key: string, value: T): void {
    this.state.set(key, value);
  }

  public get<TResponse>(key: string): TResponse | undefined {
    return this.state.get(key);
  }

  public has(key: string): boolean {
    return this.state.has(key);
  }

  public delete(key: string): boolean {
    return this.state.delete(key);
  }

  public clear(): void {
    this.state.clear();
  }
}
