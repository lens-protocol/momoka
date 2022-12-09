import { verifierWatcher } from './main';

verifierWatcher().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
