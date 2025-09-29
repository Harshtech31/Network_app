#!/usr/bin/env node

/**
 * 📱 Final Network APK Build Script
 * Builds Android APK using EAS Build
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('📱 Starting Final Network APK Build...\n');

const config = {
  frontendDir: './frontend',
  buildProfile: 'production',
  platform: 'android'
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

function checkPrerequisites() {
  console.log('🔍 Checking prerequisites...');
  
  // Check if in frontend directory
  if (!fs.existsSync(path.join(config.frontendDir, 'package.json'))) {
    console.error('❌ Frontend package.json not found');
    process.exit(1);
  }
  
  // Check if EAS is configured
  if (!fs.existsSync(path.join(config.frontendDir, 'eas.json'))) {
    console.error('❌ EAS configuration not found');
    process.exit(1);
  }
  
  console.log('✅ Prerequisites check passed\n');
}

function installDependencies() {
  runCommand(
    `cd ${config.frontendDir} && npm ci`,
    'Installing dependencies'
  );
}

function checkEASLogin() {
  console.log('🔐 Checking EAS login status...');
  try {
    execSync('eas whoami', { stdio: 'pipe' });
    console.log('✅ EAS login verified\n');
  } catch (error) {
    console.log('⚠️  Not logged in to EAS. Please run: eas login');
    console.log('   Or set EXPO_TOKEN environment variable\n');
  }
}

function buildAPK() {
  console.log('🏗️  Building Android APK...');
  console.log('   This may take 10-15 minutes...\n');
  
  runCommand(
    `cd ${config.frontendDir} && eas build --platform ${config.platform} --profile ${config.buildProfile} --non-interactive`,
    'Building APK with EAS'
  );
}

function buildLocalAPK() {
  console.log('🏗️  Building local development APK...');
  
  runCommand(
    `cd ${config.frontendDir} && npx expo run:android --variant release`,
    'Building local APK'
  );
}

function printBuildInfo() {
  console.log('🎉 APK Build completed successfully!\n');
  console.log('📊 Build Summary:');
  console.log(`   📱 Platform: Android`);
  console.log(`   🏗️  Profile: ${config.buildProfile}`);
  console.log(`   📦 Type: APK`);
  console.log(`   🌟 App: Final Network Social Platform\n`);
  
  console.log('📥 Download Instructions:');
  console.log('   1. Check your EAS dashboard: https://expo.dev');
  console.log('   2. Download the APK from the builds section');
  console.log('   3. Install on Android device (enable unknown sources)');
  console.log('   4. Test all features before distribution\n');
  
  console.log('🔗 Next Steps:');
  console.log('   1. Test APK on multiple Android devices');
  console.log('   2. Prepare for Google Play Store submission');
  console.log('   3. Set up app signing and release management');
  console.log('   4. Configure app store listing and screenshots\n');
  
  console.log('📱 Final Network APK is ready for distribution! 📱');
}

// Main build process
async function main() {
  try {
    checkPrerequisites();
    installDependencies();
    checkEASLogin();
    
    // Ask user for build type
    const buildType = process.argv[2] || 'eas';
    
    if (buildType === 'local') {
      buildLocalAPK();
    } else {
      buildAPK();
    }
    
    printBuildInfo();
  } catch (error) {
    console.error('❌ APK build failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main };
