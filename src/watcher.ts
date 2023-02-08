import { checkDAProof, startDAVerifierNode } from './';
import { consoleLog } from './logger';

startDAVerifierNode().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

checkDAProof('d9TUG-jz5q-sa-58tE_JKMbGNwpurlJMOaYKXOrwPmc', {
  log: consoleLog,
  verifyPointer: true,
}).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
