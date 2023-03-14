import { getParamOrExit } from './helpers';
import { verifierFailedSubmissionsWatcher } from './watchers/failed-submissons.watcher';

verifierFailedSubmissionsWatcher(getParamOrExit('DB_LOCATION_FOLDER_PATH')).catch((error) => {
  console.error('DA verifier failed watcher failed to startup', error);
  process.exitCode = 1;
});
