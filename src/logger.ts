export const consoleLog = (message: string, ...optionalParams: any[]) => {
  console.log('\x1b[32m', message, ...optionalParams);
};
