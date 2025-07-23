#!/usr/bin/env node

import { PostBuildTestChain } from './tests/post-build-test-chain.js';

console.log('🔍 MoovinLeads Build Status Check');
console.log('=================================');

const testChain = new PostBuildTestChain();

testChain.runAllTests()
  .then(success => {
    if (success) {
      console.log('\n🎉 BUILD STATUS: READY FOR DEPLOYMENT');
      console.log('All systems operational. Widget is functioning correctly.');
    } else {
      console.log('\n⚠️  BUILD STATUS: NEEDS ATTENTION');
      console.log('Some issues detected. Review test results above.');
    }
    
    console.log('\n📖 Available Commands:');
    console.log('  npm run test:chain  - Run full test chain');
    console.log('  npm run test:quick  - Quick functionality test');
    console.log('  npm run test:debug  - Detailed debugging test');
    console.log('  npm run build       - Build and test');
    
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('\n❌ BUILD STATUS: CRITICAL ERROR');
    console.error('Test chain failed to execute:', error.message);
    process.exit(1);
  });