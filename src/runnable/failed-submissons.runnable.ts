import { verifierFailedSubmissionsWatcher } from '../watchers/failed-submissons.watcher';

/**
 * Watches for failed submissions in the database and logs a summary of the errors.
 */
verifierFailedSubmissionsWatcher().catch((error) => {
  console.error('DA verifier failed watcher failed to startup', error);
  process.exitCode = 1;
});
