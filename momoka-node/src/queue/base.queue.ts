import { sleep } from '../common/helpers';

/**
 * A queue is a data structure that follows the FIFO (First In First Out) principle.
 */
export class Queue<T> {
  private items: T[];

  constructor() {
    this.items = [];
  }

  public enqueue(item: T): void {
    this.items.push(item);
  }

  /**
   *  Enqueues an item with a delay to not spam the event loop
   * @param item The item
   * @param delay The delay in milliseconds
   */
  public async enqueueWithDelay(item: T, delay: number): Promise<void> {
    await sleep(delay);
    this.enqueue(item);
  }

  public dequeue(): T | undefined {
    if (this.isEmpty()) {
      return undefined;
    }
    return this.items.shift();
  }

  public isEmpty(): boolean {
    return this.items.length === 0;
  }
}
