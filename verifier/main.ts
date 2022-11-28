import { ethers, network } from 'hardhat';
import fetch from 'node-fetch-commonjs';
import { getArweaveTransactionsAPI } from './get-arweave-transactions.api';
import { LENS_PROXY_ABI, LENS_PROXY_MUMBAI_CONTRACT } from './lens-proxy-info';

const fork = async (blockNumber: number) => {
  await network.provider.request({
    method: 'hardhat_reset',
    params: [
      {
        forking: {
          jsonRpcUrl:
            // TODO nuke key and move to env later on!
            'https://polygon-mumbai.g.alchemy.com/v2/lYqDZAMIfEqR6I7a6h6DmgkcP2ran6qW',
          blockNumber,
        },
      },
    ],
  });
};

const sleep = (milliseconds: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

let signer: any;
let lensHub: any;

const parseSignature = (signature: string, deadline: number) => {
  const splitSign = ethers.utils.splitSignature(signature);
  return {
    r: splitSign.r,
    s: splitSign.s,
    v: splitSign.v,
    deadline,
  };
};

const checkDASubmisson = async (arweaveId: string) => {
  console.log(`Checking for submission - ${arweaveId}`);
  const metadata = await fetch(`https://arweave.net/${arweaveId}`);
  // TODO do typings
  const result: any = await metadata.json();
  console.log(`${arweaveId} - result`, result);

  await fork(result.proofs.blockNumber);

  switch (result.type) {
    case 'POST_CREATED':
      const request = {
        profileId: result.proofs.typedData.value.profileId,
        contentURI: result.proofs.typedData.value.contentURI,
        collectModule: result.proofs.typedData.value.collectModule,
        collectModuleInitData:
          result.proofs.typedData.value.collectModuleInitData,
        referenceModule: result.proofs.typedData.value.referenceModule,
        referenceModuleInitData:
          result.proofs.typedData.value.referenceModuleInitData,
        sig: parseSignature(
          result.proofs.signature,
          result.proofs.signatureDeadline
        ),
      };

      console.log('request', request);

      const simulate = await lensHub.postWithSig(request);
      console.log('simulate', simulate);
      const blockchainResult = await simulate.wait();
      console.log('blockchainResult', blockchainResult);
      break;
    default:
      throw new Error('Unknown type');
  }
};

const verifyWatcher = async () => {
  console.log('Verify watcher started');
  const [executor] = await ethers.getSigners();
  signer = executor;
  console.log('Setup the signer address', executor.address);

  console.log('Setup the lens hub proxy', LENS_PROXY_MUMBAI_CONTRACT);
  // setup lens hub contract
  lensHub = new ethers.Contract(
    LENS_PROXY_MUMBAI_CONTRACT,
    LENS_PROXY_ABI,
    executor
  );
  console.log(
    'Complete setup of the lens hub proxy',
    LENS_PROXY_MUMBAI_CONTRACT
  );

  while (true) {
    console.log('Checking for new submissions');
    const arweaveTransactions = await getArweaveTransactionsAPI();
    if (!arweaveTransactions?.edges) {
      console.log(
        'No more transactions to check. Sleep for 5 seconds then check again'
      );
      sleep(5000);
    }

    console.log('Found new submissions', arweaveTransactions!.edges.length);

    for (let i = 0; i < arweaveTransactions!.edges.length; i++) {
      await checkDASubmisson(arweaveTransactions!.edges[i].node.id);
    }

    break;
  }
};

verifyWatcher().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
