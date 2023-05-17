import { TxValidatedResult } from '../../input-output/tx-validated-results';

export type StreamResult = TxValidatedResult;
export type StreamCallback = (result: StreamResult) => void;
