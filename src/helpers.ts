export const deepClone = <T>(object: T): T => {
  return JSON.parse(JSON.stringify(object)) as T;
};

export const sleep = (milliseconds: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

export const getParamOrExit = (name: string): string => {
  const param = process.env[name];
  if (!param) {
    console.error(`Required config param '${name}' missing`);
    process.exit(1);
  }
  return param;
};

export const getParam = (name: string): string | null => {
  const param = process.env[name];
  if (!param) {
    return null;
  }
  return param;
};

export const base64StringToJson = <T>(base64String: string): T => {
  const buffer = Buffer.from(base64String, 'base64');
  const jsonString = buffer.toString('utf-8');
  return JSON.parse(jsonString) as T;
};

export const unixTimestampToMilliseconds = (unixTimestamp: number): number => unixTimestamp * 1000;

const padLeft = (nr: number, len = 2, chr = `0`) => `${nr}`.padStart(len, chr);

export const formatDate = (date: Date): string => {
  return `${padLeft(date.getMonth() + 1)}/${padLeft(
    date.getDate()
  )}/${date.getFullYear()} ${padLeft(date.getHours())}:${padLeft(date.getMinutes())}:${padLeft(
    date.getSeconds()
  )}`;
};
