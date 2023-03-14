// import { checkDAProof, Environment, EthereumNode, startDAVerifierNode } from './';
// import { Deployment } from './environment';
// import { getParam, getParamOrExit } from './helpers';

import { Deployment, Environment } from '../common/environment';
import { getParam, getParamOrExit } from '../common/helpers';
import { EthereumNode } from '../evm/ethereum';
import { startDAVerifierNode } from '../index';

const ethereumNode: EthereumNode = {
  environment: getParamOrExit('ETHEREUM_NETWORK') as Environment,
  nodeUrl: getParamOrExit('NODE_URL'),
  deployment: (getParam('DEPLOYMENT') as Deployment) || Deployment.PRODUCTION,
};

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
