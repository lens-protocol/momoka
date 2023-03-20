import { Worker } from 'worker_threads';
import { HandlerWorkerData } from './handler-communication.worker';

export class WorkerPool {
  private workers: Worker[] = [];
  private queue: (() => void)[] = [];

  constructor() {
    // Set the pool size to the number of available CPU cores
    const size = require('os').cpus().length;
    const path = require('path');
    const workerPath = path.resolve(__dirname, 'handler-communication.worker.js');
    for (let i = 0; i < size; i++) {
      const worker = new Worker(workerPath);
      worker.on('message', (_result) => {
        this.queue.shift()?.();
      });
      this.workers.push(worker);
    }
  }

  public execute<T>(request: HandlerWorkerData): Promise<T> {
    const availableWorker = this.workers.shift();
    if (!availableWorker) {
      return new Promise((resolve) => {
        this.queue.push(() => resolve(this.execute(request)));
      });
    }

    return new Promise((resolve, _reject) => {
      availableWorker.once('message', (result) => {
        resolve(result);
        this.workers.push(availableWorker);
        this.queue.shift()?.();
      });

      availableWorker.postMessage(JSON.stringify(request));
    });
  }
}
