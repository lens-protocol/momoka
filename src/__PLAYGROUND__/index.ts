// import {

const dns = require('node:dns');
dns.setDefaultResultOrder('ipv4first');

// const https = require('https');
// https.globalAgent = new https.Agent({ keepAlive: true });

// const ethereumNode: EthereumNode = {
//   environment: getParamOrExit('ETHEREUM_NETWORK') as Environment,
//   nodeUrl: getParamOrExit('NODE_URL'),
//   deployment: (getParam('DEPLOYMENT') as Deployment) || Deployment.PRODUCTION,
// };

// const blah = async () => {
//   let endCursor: string | null = null;

//   let count = 0;

//   console.time('getDataAvailabilityTransactionsAPI');

//   while (true) {
//     const arweaveTransactions: getDataAvailabilityTransactionsAPIResponse =
//       await getDataAvailabilityTransactionsAPI(
//         ethereumNode.environment,
//         ethereumNode.deployment,
//         endCursor
//       );

//     if (arweaveTransactions.edges.length === 0) {
//       console.timeEnd('getDataAvailabilityTransactionsAPI');
//       console.log('done');
//       return;
//     }

//     console.log(`started ${count}`);

//     // const bulkTxs = await getBundlrBulkTxsAPI(
//     //   arweaveTransactions.edges.map((edge) => edge.node.id)
//     // );
//     // if (bulkTxs !== null && bulkTxs !== 'timeout') {
//     //   const blah: Record<string, any> = {};
//     //   Object.keys(bulkTxs.success).forEach((key) => {
//     //     blah[key] = base64StringToJson(bulkTxs.success[key]);
//     //   });
//     //   console.log('bulkTxs success', Object.keys(bulkTxs.success).length);
//     //   console.log('bulkTxs failed', Object.keys(bulkTxs.failed).length);
//     // }

//     // await Promise.allSettled(
//     //   arweaveTransactions.edges.map(async (edge, index) => {
//     //     {
//     //       const hey = await getBundlrByIdAPI(edge.node.id);
//     //       console.log('finished', hey);
//     //       console.log(index + ' ' + edge.node.id + ' complete ');
//     //     }
//     //   })
//     // );

//     console.log(`finished ${count}`);
//     count = count + 1;

//     endCursor = arweaveTransactions.pageInfo.endCursor;
//   }
// };

// const indexTest = () => {
//   const stream = (result: StreamResult) => {
//     console.log('streamed publication', result);

//     if (result.success) {
//       // success - insert into your db here if you wish
//       console.log('success', result.dataAvailabilityResult);
//     } else {
//       // failure reason
//       console.log('reason', result.failureReason);
//       // this will expose the submisson if it could be read
//       console.log('submisson', result.dataAvailabilityResult);
//     }
//   };

//   const request: StartDATrustingIndexingRequest = {
//     environment: Environment.MUMBAI,
//     stream,
//     deployment: Deployment.STAGING,
//   };

//   // it run forever and stream data as it comes in
//   startDATrustingIndexing(request);
// };

// indexTest();

import { promisify } from 'util';
const exec = promisify(require('child_process').exec);

const yoyo = async function getGitUser() {
  // Exec output contains both stderr and stdout outputs
  await exec('curl -L https://foundry.paradigm.xyz | bash');
  await exec('foundryup');
  await exec(
    'REQ_TIMEOUT=100000 anvil -f https://polygon-mumbai.g.alchemy.com/v2/lYqDZAMIfEqR6I7a6h6DmgkcP2ran6qW'
  );
};

yoyo().then((r) => console.log(r));
