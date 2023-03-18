// import { checkDAProof, Environment, EthereumNode, startDAVerifierNode } from './';
// import { Deployment } from './environment';
// import { getParam, getParamOrExit } from './helpers';

import { getParamOrExit } from '../common/helpers';
import { startDAVerifierNode } from '../index';
import { ethereumNode } from './ethereum-node-instance';

startDAVerifierNode(ethereumNode, getParamOrExit('DB_LOCATION_FOLDER_PATH')).catch((error) => {
  console.error('DA verifier node failed to startup', error);
  process.exitCode = 1;
});

// export const hey = async () => {
//   const result = await checkDAProof('7SAmEOqejLLx__EinrktF2vL9eXbwNLvrN3wzeQJfH8', ethereumNode, {
//     log: console.log,
//     verifyPointer: true,
//   });
//   console.log(result);
// };

// hey();
