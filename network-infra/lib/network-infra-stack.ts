import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as docdb from 'aws-cdk-lib/aws-docdb';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export interface NetworkInfraStackProps extends cdk.StackProps {
  environmentName: string;
  domainName: string;
  apiDomain: string;
}

export class NetworkInfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: NetworkInfraStackProps) {
    super(scope, id, props);

    // Access the custom properties
    const { environmentName, domainName, apiDomain } = props;
    
    // Log the environment info (for debugging)
    console.log(`Deploying ${environmentName} environment`);
    console.log(`Domain: ${domainName}`);
    console.log(`API Domain: ${apiDomain}`);

    // The code that defines your stack goes here
    // You can now use environmentName, domainName, and apiDomain in your stack
    const vpc = new ec2.Vpc(this, `${environmentName}VPC`, {
      maxAzs: 2,
      natGateways: 1,
      vpcName: `${environmentName}-network-vpc`,
    });
    // Define username as a plain string (not secret)
    const dbUsername = `networkadmin${environmentName}`;
    
    // Create secret for password only
    const dbCredentials = new secretsmanager.Secret(this, `${environmentName}DBCredentials`, {
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ 
          username: dbUsername,
          dbname: `network_${environmentName}`
        }),
        generateStringKey: 'password',
        excludePunctuation: true,
        excludeCharacters: '"@/\\',
      },
      description: `Database credentials for ${environmentName} environment`,
    });

    const dbCluster = new docdb.DatabaseCluster(this, `${environmentName}NetworkDB`, {
      masterUser: {
        username: dbUsername,
        password: dbCredentials.secretValueFromJson('password'),
      },
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MEDIUM),
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      dbClusterName: `network-${environmentName}-cluster`,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Change to RETAIN for production
    });

    // Lambda Function for Backend API
    const lambdaRole = new iam.Role(this, `${environmentName}LambdaRole`, {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaVPCAccessExecutionRole'),
      ],
    });

    // Grant Lambda access to Secrets Manager
    dbCredentials.grantRead(lambdaRole);

    const backendLambda = new lambda.Function(this, `${environmentName}BackendLambda`, {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'lambda-simple.handler',
      code: lambda.Code.fromAsset('../backend', {
        exclude: ['.git', '.env*', 'tests', '*.log', '*.md', '.gitignore', 'nodemon.json', 'jest.config*', 'server.js', 'setup.js'],
      }),
      role: lambdaRole,
      vpc: vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      environment: {
        NODE_ENV: environmentName,
        DB_SECRET_ARN: dbCredentials.secretArn,
        DOCDB_HOST: dbCluster.clusterEndpoint.hostname,
        DOCDB_PORT: '27017',
      },
      timeout: cdk.Duration.seconds(30),
      memorySize: 1024,
      description: `Enhanced Backend API Lambda for ${environmentName} environment - v2.0.1`,
    });

    // API Gateway
    const api = new apigateway.RestApi(this, `${environmentName}Api`, {
      restApiName: `network-${environmentName}-api`,
      description: `Network API for ${environmentName} environment`,
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'X-Amz-Security-Token',
        ],
      },
      deployOptions: {
        stageName: environmentName,
        throttlingRateLimit: 1000,
        throttlingBurstLimit: 2000,
      },
    });

    // Lambda integration with proper proxy configuration
    const lambdaIntegration = new apigateway.LambdaIntegration(backendLambda, {
      proxy: true,
      allowTestInvoke: true,
    });

    // Add proxy resource to handle all API routes
    const proxyResource = api.root.addResource('{proxy+}');
    proxyResource.addMethod('ANY', lambdaIntegration);
    
    // Handle root path
    api.root.addMethod('ANY', lambdaIntegration);

    // Outputs
    new cdk.CfnOutput(this, `${environmentName}DatabaseEndpoint`, {
      value: dbCluster.clusterEndpoint.socketAddress,
      description: `DocumentDB endpoint for ${environmentName}`,
    });

    new cdk.CfnOutput(this, `${environmentName}SecretArn`, {
      value: dbCredentials.secretArn,
      description: `Secret ARN for ${environmentName} database credentials`,
    });

    new cdk.CfnOutput(this, `${environmentName}ApiUrl`, {
      value: api.url,
      description: `API Gateway URL for ${environmentName} environment`,
    });

    new cdk.CfnOutput(this, `${environmentName}LambdaFunctionName`, {
      value: backendLambda.functionName,
      description: `Lambda function name for ${environmentName} environment`,
    });
  }
}