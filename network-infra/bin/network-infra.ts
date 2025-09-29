import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { NetworkInfraStack } from '../lib/network-infra-stack';

const app = new cdk.App();

// Staging environment
new NetworkInfraStack(app, 'NetworkStagingStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
  environmentName: 'staging',
  domainName: 'network-cl.com',
  apiDomain: 'api.staging.network-cl.com',
});

// Production environment
new NetworkInfraStack(app, 'NetworkProductionStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
  environmentName: 'production',
  domainName: 'network-cl.com',
  apiDomain: 'api.network-cl.com',
});
