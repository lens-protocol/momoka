import { startDAVerifierNode } from './';

startDAVerifierNode().catch((error) => {
  console.error('DA verifier node failed to startup', error);
  process.exitCode = 1;
});
