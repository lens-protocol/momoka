import { Environment, EthereumNode, startDAVerifierNode } from './';
import { getParamOrExit } from './helpers';

const ethereumNode: EthereumNode = {
  environment: getParamOrExit('ETHEREUM_NETWORK') as Environment,
  nodeUrl: getParamOrExit('NODE_URL'),
};

startDAVerifierNode(ethereumNode).catch((error) => {
  console.error('DA verifier node failed to startup', error);
  process.exitCode = 1;
});
