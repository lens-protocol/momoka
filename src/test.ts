import {
  getDataAvailabilityTransactionsAPI,
  getDataAvailabilityTransactionsAPIResponse,
} from './bundlr/get-data-availability-transactions.api';
import { Deployment, Environment } from './environment';
import { EthereumNode } from './ethereum';
import { getParam, getParamOrExit } from './helpers';

const dns = require('node:dns');
dns.setDefaultResultOrder('ipv4first');

// const https = require('https');
// https.globalAgent = new https.Agent({ keepAlive: true });

const ethereumNode: EthereumNode = {
  environment: getParamOrExit('ETHEREUM_NETWORK') as Environment,
  nodeUrl: getParamOrExit('NODE_URL'),
  deployment: (getParam('DEPLOYMENT') as Deployment) || Deployment.PRODUCTION,
};

const blah = async () => {
  let endCursor: string | null = null;

  let count = 0;

  console.time('getDataAvailabilityTransactionsAPI');

  while (true) {
    const arweaveTransactions: getDataAvailabilityTransactionsAPIResponse =
      await getDataAvailabilityTransactionsAPI(
        ethereumNode.environment,
        ethereumNode.deployment,
        endCursor
      );

    if (arweaveTransactions.edges.length === 0) {
      console.timeEnd('getDataAvailabilityTransactionsAPI');
      console.log('done');
      return;
    }

    console.log(`started ${count}`);

    // const bulkTxs = await getBundlrBulkTxsAPI(
    //   arweaveTransactions.edges.map((edge) => edge.node.id)
    // );
    // if (bulkTxs !== null && bulkTxs !== 'timeout') {
    //   const blah: Record<string, any> = {};
    //   Object.keys(bulkTxs.success).forEach((key) => {
    //     blah[key] = base64StringToJson(bulkTxs.success[key]);
    //   });
    //   console.log('bulkTxs success', Object.keys(bulkTxs.success).length);
    //   console.log('bulkTxs failed', Object.keys(bulkTxs.failed).length);
    // }

    // await Promise.allSettled(
    //   arweaveTransactions.edges.map(async (edge, index) => {
    //     {
    //       const hey = await getBundlrByIdAPI(edge.node.id);
    //       console.log('finished', hey);
    //       console.log(index + ' ' + edge.node.id + ' complete ');
    //     }
    //   })
    // );

    console.log(`finished ${count}`);
    count = count + 1;

    endCursor = arweaveTransactions.pageInfo.endCursor;
  }
};

blah();
