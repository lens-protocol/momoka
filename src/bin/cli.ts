#!/usr/bin/env node

import { Deployment, Environment } from '../common/environment';
import { getProgramArguments, turnedOffExperimentalWarning } from '../common/helpers';
import { startDAVerifierNode } from '../watchers/verifier.watcher';

turnedOffExperimentalWarning();

const args = getProgramArguments();

const nodeUrl = args.options.node;
if (!nodeUrl) {
  console.log('No node url specified');
  process.exit(1);
}
const environment = (args.options.environment as Environment) || Environment.MUMBAI;
const deployment = (args.options.deployment as Deployment) || Deployment.STAGING;

const concurrencyRaw = args.options.concurrency;
const concurrency = concurrencyRaw ? Number(concurrencyRaw) : 100;

startDAVerifierNode(
  {
    nodeUrl,
    environment,
    deployment,
  },
  concurrency
).catch((error) => {
  console.error('DA verifier node failed to startup', error);
  process.exitCode = 1;
});
