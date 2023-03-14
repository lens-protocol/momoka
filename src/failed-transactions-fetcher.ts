import { ClaimableValidatorError } from './claimable-validator-errors';
import { getFailedTransactionsDb, startDb } from './db';
import { getParamOrExit } from './helpers';

const failedTransactionFetcher = async () => {
  startDb(getParamOrExit('DB_LOCATION_FOLDER_PATH'));
  const failedTransactions = await getFailedTransactionsDb();
  console.log(failedTransactions.filter((c) => c.reason === ClaimableValidatorError.INVALID_TX_ID));
};

failedTransactionFetcher();
