#!/usr/bin/env node

// Comprehensive database integration test for AI4Designers
const fs = require('fs');
const path = require('path');

console.log('🧪 AI4Designers Database Integration Test\n');

// Test results
const results = {
  passed: [],
  failed: [],
  warnings: []
};

// Helper function to log results
function logTest(name, passed, message, details = null) {
  if (passed) {
    results.passed.push({ name, message, details });
    console.log(`✅ ${name}: ${message}`);
  } else {
    results.failed.push({ name, message, details });
    console.log(`❌ ${name}: ${message}`);
  }
}

function logWarning(name, message, details = null) {
  results.warnings.push({ name, message, details });
  console.log(`⚠️  ${name}: ${message}`);
}

// Test 1: Check if environment variables are set
console.log('\n📋 Test 1: Environment Variables');
try {
  const envPath = path.join(process.cwd(), '.env.local');
  const envExists = fs.existsSync(envPath);

  if (envExists) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const hasSupabaseUrl = envContent.includes('NEXT_PUBLIC_SUPABASE_URL');
    const hasSupabaseKey = envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY');

    logTest('Environment File', envExists, 'Environment file exists');
    logTest('Supabase URL', hasSupabaseUrl, hasSupabaseUrl ? 'Supabase URL is configured' : 'Supabase URL is missing');
    logTest('Supabase Key', hasSupabaseKey, hasSupabaseKey ? 'Supabase key is configured' : 'Supabase key is missing');
  } else {
    logTest('Environment File', false, 'Environment file not found');
  }
} catch (error) {
  logTest('Environment Variables', false, `Error checking environment: ${error.message}`);
}

// Test 2: Check API routes structure
console.log('\n📋 Test 2: API Routes Structure');
const apiDir = path.join(process.cwd(), 'src/app/api');
if (fs.existsSync(apiDir)) {
  const apiRoutes = fs.readdirSync(apiDir, { recursive: true });
  const routeFiles = apiRoutes.filter(file => file.endsWith('route.ts'));

  const expectedRoutes = [
    'progress/route.ts',
    'create-user/route.ts',
    'profile/route.ts',
    'test-connection/route.ts',
    'db-test/route.ts',
    'check-tables/route.ts'
  ];

  expectedRoutes.forEach(route => {
    const routeExists = routeFiles.some(file => file.endsWith(route));
    logTest(`API Route: ${route}`, routeExists, routeExists ? 'Route exists' : 'Route missing');
  });

  logTest('API Routes Structure', true, `Found ${routeFiles.length} API route files`);
} else {
  logTest('API Routes Structure', false, 'API directory not found');
}

// Test 3: Check database schema files
console.log('\n📋 Test 3: Database Schema Files');
const schemaFiles = [
  'src/lib/supabase/schema.ts',
  'src/lib/supabase/migrations/001_initial_schema.sql'
];

schemaFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  const exists = fs.existsSync(filePath);
  logTest(`Schema File: ${file}`, exists, exists ? 'Schema file exists' : 'Schema file missing');
});

// Test 4: Check Supabase client configuration
console.log('\n📋 Test 4: Supabase Client Configuration');
const supabaseClientPath = path.join(process.cwd(), 'src/lib/supabase/client.ts');
const supabaseServerPath = path.join(process.cwd(), 'src/lib/supabase/server.ts');

[supabaseClientPath, supabaseServerPath].forEach(filePath => {
  const fileName = path.basename(filePath);
  const exists = fs.existsSync(filePath);
  if (exists) {
    const content = fs.readFileSync(filePath, 'utf8');
    const hasCreateClient = content.includes('createClient');
    logTest(`Supabase ${fileName}`, hasCreateClient, hasCreateClient ? 'Properly configured' : 'Missing createClient');
  } else {
    logTest(`Supabase ${fileName}`, false, 'File not found');
  }
});

// Test 5: Check authentication configuration
console.log('\n📋 Test 5: Authentication Configuration');
const authPath = path.join(process.cwd(), 'src/lib/auth.ts');
if (fs.existsSync(authPath)) {
  const authContent = fs.readFileSync(authPath, 'utf8');
  const hasGoogleAuth = authContent.includes('google');
  const isDisabled = authContent.includes('disabled');

  logTest('Google Auth', hasGoogleAuth, hasGoogleAuth ? 'Google auth configured' : 'Google auth not configured');
  logTest('Auth Status', isDisabled, isDisabled ? 'Auth is disabled (demo mode)' : 'Auth is enabled');
} else {
  logTest('Auth Configuration', false, 'Auth file not found');
}

// Test 6: Check RLS policies
console.log('\n📋 Test 6: RLS Policies');
const rlsPath = path.join(process.cwd(), 'src/lib/supabase/rls-policies.sql');
if (fs.existsSync(rlsPath)) {
  const rlsContent = fs.readFileSync(rlsPath, 'utf8');
  const hasUserPolicies = rlsContent.includes('users');
  const hasProgressPolicies = rlsContent.includes('user_progress');

  logTest('User RLS Policies', hasUserPolicies, hasUserPolicies ? 'User policies defined' : 'User policies missing');
  logTest('Progress RLS Policies', hasProgressPolicies, hasProgressPolicies ? 'Progress policies defined' : 'Progress policies missing');
} else {
  logWarning('RLS Policies', 'RLS policies file not found');
}

// Test 7: Check test files
console.log('\n📋 Test 7: Test Files');
const testDir = path.join(process.cwd(), 'tests');
if (fs.existsSync(testDir)) {
  const testFiles = fs.readdirSync(testDir);
  const hasIntegrationTests = testFiles.some(file => file.includes('integration'));
  const hasApiTests = testFiles.some(file => file.includes('api'));

  logTest('Integration Tests', hasIntegrationTests, hasIntegrationTests ? 'Integration tests exist' : 'Integration tests missing');
  logTest('API Tests', hasApiTests, hasApiTests ? 'API tests exist' : 'API tests missing');
} else {
  logTest('Test Directory', false, 'Test directory not found');
}

// Test 8: Check package.json scripts
console.log('\n📋 Test 8: Package.json Scripts');
const packagePath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packagePath)) {
  const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const scripts = packageContent.scripts || {};
  const hasPlaywright = scripts.hasOwnProperty('test:e2e') || scripts.hasOwnProperty('test:playwright');
  const hasBuild = scripts.hasOwnProperty('build');
  const hasDev = scripts.hasOwnProperty('dev');

  logTest('Playwright Tests', hasPlaywright, hasPlaywright ? 'Playwright test scripts configured' : 'Playwright test scripts missing');
  logTest('Build Script', hasBuild, hasBuild ? 'Build script exists' : 'Build script missing');
  logTest('Dev Script', hasDev, hasDev ? 'Dev script exists' : 'Dev script missing');
} else {
  logTest('Package.json', false, 'Package.json not found');
}

// Summary
console.log('\n📊 Test Summary');
console.log('================');
console.log(`✅ Passed: ${results.passed.length}`);
console.log(`❌ Failed: ${results.failed.length}`);
console.log(`⚠️  Warnings: ${results.warnings.length}`);
console.log(`Total Tests: ${results.passed.length + results.failed.length + results.warnings.length}`);

if (results.failed.length > 0) {
  console.log('\n❌ Failed Tests:');
  results.failed.forEach(test => {
    console.log(`  - ${test.name}: ${test.message}`);
  });
}

if (results.warnings.length > 0) {
  console.log('\n⚠️  Warnings:');
  results.warnings.forEach(test => {
    console.log(`  - ${test.name}: ${test.message}`);
  });
}

// Overall assessment
console.log('\n🎯 Overall Assessment');
console.log('===================');
const totalTests = results.passed.length + results.failed.length;
const passRate = totalTests > 0 ? (results.passed.length / totalTests) * 100 : 0;

if (passRate >= 80) {
  console.log('🟢 Database integration is in good condition');
} else if (passRate >= 60) {
  console.log('🟡 Database integration needs some attention');
} else {
  console.log('🔴 Database integration requires significant work');
}

console.log(`Pass rate: ${passRate.toFixed(1)}%`);

// Recommendations
console.log('\n💡 Recommendations');
console.log('=================');
if (results.failed.length > 0) {
  console.log('1. Fix failed tests before proceeding with database operations');
}
if (results.warnings.length > 0) {
  console.log('2. Address warnings to improve system stability');
}
console.log('3. Run API endpoint tests to verify actual functionality');
console.log('4. Test with real Supabase connection when available');

process.exit(results.failed.length > 0 ? 1 : 0);