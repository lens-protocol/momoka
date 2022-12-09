export const deepClone = <T>(object: T): T => {
  return JSON.parse(JSON.stringify(object)) as T;
};

export const sleep = (milliseconds: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};
