import { LogFunctionType } from '../../common/logger';

export interface CheckDASubmissionOptions {
  verifyPointer: boolean;
  byPassDb: boolean;
  log: LogFunctionType;
}

export const getDefaultCheckDASubmissionOptions: CheckDASubmissionOptions = {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  log: () => {},
  byPassDb: false,
  verifyPointer: true,
};
