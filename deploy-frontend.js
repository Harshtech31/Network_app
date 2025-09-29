#!/usr/bin/env node

/**
 * 🚀 Final Network Frontend Deployment Script
 * Deploys the React Native web build to AWS S3 + CloudFront
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Final Network Frontend Deployment...\n');

// Configuration
const config = {
  bucketName: 'final-network-web-app',
  distributionId: process.env.CLOUDFRONT_DISTRIBUTION_ID,
  region: 'us-east-1',
  frontendDir: './frontend',
  buildDir: './frontend/dist'
};

function runCommand(command, description) {
  console.log(`📦 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit', cwd: process.cwd() });
    console.log(`✅ ${description} completed\n`);
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    process.exit(1);
  }
}

function checkAWSCredentials() {
  console.log('🔐 Checking AWS credentials...');
  try {
    execSync('aws sts get-caller-identity', { stdio: 'pipe' });
    console.log('✅ AWS credentials configured\n');
  } catch (error) {
    console.error('❌ AWS credentials not configured. Please run: aws configure');
    process.exit(1);
  }
}

function createS3Bucket() {
  console.log(`🪣 Creating S3 bucket: ${config.bucketName}...`);
  try {
    // Create bucket
    execSync(`aws s3 mb s3://${config.bucketName} --region ${config.region}`, { stdio: 'pipe' });
    
    // Configure for static website hosting
    const websiteConfig = {
      IndexDocument: { Suffix: 'index.html' },
      ErrorDocument: { Key: 'index.html' }
    };
    
    fs.writeFileSync('/tmp/website-config.json', JSON.stringify(websiteConfig));
    execSync(`aws s3api put-bucket-website --bucket ${config.bucketName} --website-configuration file:///tmp/website-config.json`, { stdio: 'pipe' });
    
    // Set public read policy
    const bucketPolicy = {
      Version: '2012-10-17',
      Statement: [{
        Sid: 'PublicReadGetObject',
        Effect: 'Allow',
        Principal: '*',
        Action: 's3:GetObject',
        Resource: `arn:aws:s3:::${config.bucketName}/*`
      }]
    };
    
    fs.writeFileSync('/tmp/bucket-policy.json', JSON.stringify(bucketPolicy));
    execSync(`aws s3api put-bucket-policy --bucket ${config.bucketName} --policy file:///tmp/bucket-policy.json`, { stdio: 'pipe' });
    
    console.log('✅ S3 bucket configured for static hosting\n');
  } catch (error) {
    if (error.message.includes('BucketAlreadyOwnedByYou')) {
      console.log('✅ S3 bucket already exists\n');
    } else {
      console.log('⚠️  S3 bucket creation failed (may already exist)\n');
    }
  }
}

function buildFrontend() {
  console.log('🏗️  Building frontend for web...');
  
  // Install dependencies
  runCommand(`cd ${config.frontendDir} && npm ci`, 'Installing dependencies');
  
  // Build for web
  runCommand(`cd ${config.frontendDir} && npx expo export:web`, 'Building web application');
  
  // Verify build exists
  if (!fs.existsSync(config.buildDir)) {
    console.error('❌ Build directory not found:', config.buildDir);
    process.exit(1);
  }
  
  console.log('✅ Frontend build completed\n');
}

function deployToS3() {
  console.log(`🚀 Deploying to S3 bucket: ${config.bucketName}...`);
  
  // Sync files to S3
  runCommand(
    `aws s3 sync ${config.buildDir} s3://${config.bucketName} --delete --cache-control "public, max-age=31536000" --exclude "*.html" --exclude "service-worker.js"`,
    'Uploading static assets'
  );
  
  // Upload HTML files with no-cache
  runCommand(
    `aws s3 sync ${config.buildDir} s3://${config.bucketName} --delete --cache-control "no-cache" --include "*.html" --include "service-worker.js"`,
    'Uploading HTML files'
  );
  
  console.log('✅ Files deployed to S3\n');
}

function invalidateCloudFront() {
  if (!config.distributionId) {
    console.log('⚠️  CloudFront distribution ID not provided, skipping invalidation\n');
    return;
  }
  
  console.log('🌐 Invalidating CloudFront cache...');
  runCommand(
    `aws cloudfront create-invalidation --distribution-id ${config.distributionId} --paths "/*"`,
    'CloudFront cache invalidation'
  );
}

function printDeploymentInfo() {
  console.log('🎉 Deployment completed successfully!\n');
  console.log('📊 Deployment Summary:');
  console.log(`   🪣 S3 Bucket: ${config.bucketName}`);
  console.log(`   🌐 Website URL: http://${config.bucketName}.s3-website-${config.region}.amazonaws.com`);
  console.log(`   📱 App: Final Network Social Platform`);
  console.log(`   ✅ Status: Live and ready for users\n`);
  
  console.log('🔗 Next Steps:');
  console.log('   1. Set up CloudFront distribution for HTTPS and global CDN');
  console.log('   2. Configure custom domain name');
  console.log('   3. Set up monitoring and analytics');
  console.log('   4. Test the deployed application\n');
  
  console.log('🌟 Final Network is now live on AWS! 🌟');
}

// Main deployment process
async function main() {
  try {
    checkAWSCredentials();
    createS3Bucket();
    buildFrontend();
    deployToS3();
    invalidateCloudFront();
    printDeploymentInfo();
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main };
