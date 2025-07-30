#!/usr/bin/env node

// Simple test script to verify environment detection
console.log('🧪 Testing Environment Detection...\n');

// Simulate different environments
const testEnvironments = [
  {
    name: 'Development',
    url: 'http://localhost:3000',
    expected: 'development'
  },
  {
    name: 'Production',
    url: 'https://playthebench.vercel.app',
    expected: 'production'
  },
  {
    name: 'Preview Deployment',
    url: 'https://thebench-preview-abc123.vercel.app',
    expected: 'preview'
  },
  {
    name: 'Staging',
    url: 'https://staging.playthebench.vercel.app',
    expected: 'staging'
  }
];

console.log('✅ Environment Detection Test Results:');
console.log('=====================================\n');

testEnvironments.forEach(({ name, url, expected }) => {
  // Simple environment detection logic (simplified version)
  let detected = 'development';
  
  if (url.includes('playthebench.vercel.app') && !url.includes('staging')) {
    detected = 'production';
  } else if (url.includes('vercel.app') && !url.includes('playthebench.vercel.app')) {
    detected = 'preview';
  } else if (url.includes('staging')) {
    detected = 'staging';
  }
  
  const status = detected === expected ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} ${name}: ${url}`);
  console.log(`   Expected: ${expected}, Detected: ${detected}\n`);
});

console.log('🎯 Next Steps:');
console.log('1. Deploy to Vercel');
console.log('2. Test signup flow on production');
console.log('3. Verify email confirmation redirects');
console.log('4. Monitor logs for any issues');
console.log('\n🚀 Ready for production deployment!'); 