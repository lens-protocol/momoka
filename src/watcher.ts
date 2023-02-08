import { startDAVerifierNode } from './';

// const stream = (h: any) => {
//   console.log('YES BABY', h);
// };

startDAVerifierNode().catch((error) => {
  console.error('DA verifier node failed to startup', error);
  process.exitCode = 1;
});
