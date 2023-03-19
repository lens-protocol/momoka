import { resolve as resolvePath } from 'path';
import { Worker } from 'worker_threads';
import { HandlerWorkerData } from './handler-communication.worker';

const workerPath = resolvePath(__dirname, 'handler-communication.worker.js');

class WorkerPool {
  private workers: Worker[] = [];
  private queue: (() => void)[] = [];

  constructor() {
    // Set the pool size to the number of available CPU cores
    const size = require('os').cpus().length;
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

export const workerPool = new WorkerPool();
