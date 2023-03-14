import { getParamOrExit } from './helpers';
import { verifierFailedSubmissionsWatcher } from './watchers/failed-submissons.watcher';

/**
 * Watches for failed submissions in the database and logs a summary of the errors.
 */
verifierFailedSubmissionsWatcher(getParamOrExit('DB_LOCATION_FOLDER_PATH')).catch((error) => {
  console.error('DA verifier failed watcher failed to startup', error);
  process.exitCode = 1;
});
