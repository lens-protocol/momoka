import { Environment, EthereumNode, startDAVerifierNode } from './';
import { Deployment } from './environment';
import { getParam, getParamOrExit } from './helpers';

const ethereumNode: EthereumNode = {
  environment: getParamOrExit('ETHEREUM_NETWORK') as Environment,
  nodeUrl: getParamOrExit('NODE_URL'),
  deployment: (getParam('DEPLOYMENT') as Deployment) || Deployment.PRODUCTION,
};

startDAVerifierNode(ethereumNode, getParamOrExit('DB_LOCATION_FOLDER_PATH')).catch((error) => {
  console.error('DA verifier node failed to startup', error);
  process.exitCode = 1;
});
