import { turnedOffExperimentalWarning } from '../common/helpers';
import { startDAVerifierNode } from '../index';
import { ethereumNode } from './ethereum-node-instance';

turnedOffExperimentalWarning();

startDAVerifierNode(ethereumNode).catch((error) => {
  console.error('DA verifier node failed to startup', error);
  process.exitCode = 1;
});
