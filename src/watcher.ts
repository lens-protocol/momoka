import { Environment, EthereumNode, startDAVerifierNode } from './';
import { Deployment } from './environment';
import { getParamOrExit } from './helpers';

const ethereumNode: EthereumNode = {
  environment: getParamOrExit('ETHEREUM_NETWORK') as Environment,
  nodeUrl: getParamOrExit('NODE_URL'),
  deployment: getParamOrExit('DEPLOYMENT') as Deployment,
};

startDAVerifierNode(ethereumNode).catch((error) => {
  console.error('DA verifier node failed to startup', error);
  process.exitCode = 1;
});
