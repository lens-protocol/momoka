import { getParam, turnedOffExperimentalWarning } from '../common/helpers';
import { startDAVerifierNode } from '../watchers/verifier.watcher';
import { ethereumNode } from './ethereum-node-instance';

turnedOffExperimentalWarning();

const concurrencyRaw = getParam('CONCURRENCY');
const concurrency = concurrencyRaw ? Number(concurrencyRaw) : 100;

startDAVerifierNode(ethereumNode, concurrency, { resync: false }).catch((error) => {
  console.error('DA verifier node failed to startup', error);
  process.exitCode = 1;
});
