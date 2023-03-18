import { Deployment, Environment } from '../common/environment';
import { getParam, getParamOrExit } from '../common/helpers';
import { EthereumNode } from '../evm/ethereum';

export const ethereumNode: EthereumNode = {
  environment: getParamOrExit('ETHEREUM_NETWORK') as Environment,
  nodeUrl: getParamOrExit('NODE_URL'),
  deployment: (getParam('DEPLOYMENT') as Deployment) || Deployment.PRODUCTION,
};
