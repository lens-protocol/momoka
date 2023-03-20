let _workerPool: unknown;

// this is needed in this style to allow it to still work in the browser
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const workerPool = async () => {
  if (_workerPool) _workerPool;
  const pool = await import('./worker-pool');

  return (_workerPool = new pool.WorkerPool());
};
