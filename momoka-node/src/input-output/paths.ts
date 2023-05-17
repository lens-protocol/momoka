export type PathType = {
  join(...paths: string[]): string;
};
let _path: PathType | undefined;
export const pathResolver = async (): Promise<PathType> => {
  if (_path) return Promise.resolve(_path);

  const pathImport = await import('path');

  return (_path = pathImport);
};

let lensDAPathCache: string | undefined;
export const lensDAPath = async (): Promise<string> => {
  if (lensDAPathCache) return Promise.resolve(lensDAPathCache);

  const path = await pathResolver();
  const result = path.join(process.cwd(), 'lens__da');
  return (lensDAPathCache = result);
};

let failedProofsPathCache: string | undefined;
export const failedProofsPath = async (): Promise<string> => {
  if (failedProofsPathCache) return Promise.resolve(failedProofsPathCache);

  const path = await pathResolver();
  const result = path.join(process.cwd(), 'lens__da', 'failed-proofs');
  return (failedProofsPathCache = result);
};
