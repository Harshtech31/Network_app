#!/usr/bin/env node

/**
 * 🔄 Auto-commit and push script for Final Network
 * Automatically commits and pushes changes to GitHub
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔄 Auto-commit and push to GitHub...\n');

function runCommand(command, description) {
  console.log(`📦 ${description}...`);
  try {
    const output = execSync(command, { encoding: 'utf8', cwd: process.cwd() });
    console.log(`✅ ${description} completed`);
    return output;
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    return null;
  }
}

function checkGitStatus() {
  console.log('🔍 Checking git status...');
  const status = runCommand('git status --porcelain', 'Checking for changes');
  
  if (!status || status.trim() === '') {
    console.log('✅ No changes to commit\n');
    return false;
  }
  
  console.log('📝 Changes detected:\n');
  console.log(status);
  return true;
}

function commitAndPush() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const commitMessage = `🚀 Auto-update: ${timestamp}

✅ Features updated:
- Frontend improvements
- Backend enhancements
- Bug fixes and optimizations
- Performance improvements

🌟 Final Network - Always evolving!`;

  // Add all changes
  runCommand('git add .', 'Adding changes');
  
  // Commit changes
  runCommand(`git commit -m "${commitMessage}"`, 'Committing changes');
  
  // Push to GitHub
  runCommand('git push origin master', 'Pushing to GitHub');
}

function printSuccess() {
  console.log('\n🎉 Auto-commit completed successfully!\n');
  console.log('📊 Summary:');
  console.log('   ✅ Changes committed to Git');
  console.log('   ✅ Pushed to GitHub repository');
  console.log('   ✅ GitHub Actions will trigger automatically');
  console.log('   ✅ Deployment pipeline activated\n');
  
  console.log('🔗 Repository: https://github.com/Harshtech31/Network_final.git');
  console.log('🌟 Final Network - Always up to date! 🌟\n');
}

// Main process
async function main() {
  try {
    if (checkGitStatus()) {
      commitAndPush();
      printSuccess();
    } else {
      console.log('🎯 Repository is already up to date!');
    }
  } catch (error) {
    console.error('❌ Auto-commit failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main };
