import { TxValidatedResult } from '../input-output/db';

export type StreamResult = TxValidatedResult;
export type StreamCallback = (result: StreamResult) => void;
