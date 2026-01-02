#!/usr/bin/env node

/**
 * Test D1 database connection and schema
 */

const { execSync } = require('child_process');

console.log('🧪 Testing D1 Database Setup...\n');

const tests = [
  {
    name: 'List tables',
    command: 'wrangler d1 execute toomva-db --remote --command "SELECT name FROM sqlite_master WHERE type=\'table\'"',
  },
  {
    name: 'Check Video table schema',
    command: 'wrangler d1 execute toomva-db --remote --command "PRAGMA table_info(Video)"',
  },
  {
    name: 'Check Subtitle table schema',
    command: 'wrangler d1 execute toomva-db --remote --command "PRAGMA table_info(Subtitle)"',
  },
  {
    name: 'Count videos',
    command: 'wrangler d1 execute toomva-db --remote --command "SELECT COUNT(*) as count FROM Video"',
  },
];

let passed = 0;
let failed = 0;

tests.forEach(test => {
  try {
    console.log(`\n📝 ${test.name}...`);
    const output = execSync(test.command, { encoding: 'utf-8' });
    console.log('✅ PASSED');
    passed++;
  } catch (error) {
    console.log('❌ FAILED');
    console.error(error.message);
    failed++;
  }
});

console.log('\n' + '='.repeat(50));
console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed\n`);

if (failed === 0) {
  console.log('🎉 All tests passed! D1 database is ready.\n');
  process.exit(0);
} else {
  console.log('❌ Some tests failed. Please check the errors above.\n');
  process.exit(1);
}
