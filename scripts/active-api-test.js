#!/usr/bin/env node

// Test active API endpoints for AI4Designers
const https = require('https');
const http = require('http');

console.log('🧪 AI4Designers Active API Endpoints Test\n');

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

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    const reqOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = protocol.request(url, reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.data) {
      req.write(JSON.stringify(options.data));
    }

    req.end();
  });
}

// Test active API endpoints
const apiTests = [
  {
    name: 'Progress API',
    url: 'http://localhost:3000/api/progress',
    method: 'GET',
    expectedStatus: 200
  },
  {
    name: 'Create User API',
    url: 'http://localhost:3000/api/create-user',
    method: 'POST',
    data: {
      fullname: 'Test User',
      email: `test-${Date.now()}@example.com`,
      phone: '1234567890',
      profession: 'student',
      organization: 'Test Org'
    },
    expectedStatus: 200
  },
  {
    name: 'Test Connection API',
    url: 'http://localhost:3000/api/test-connection',
    method: 'GET',
    expectedStatus: 200
  },
  {
    name: 'Check Tables API',
    url: 'http://localhost:3000/api/check-tables',
    method: 'GET',
    expectedStatus: 200
  },
  {
    name: 'DB Test API',
    url: 'http://localhost:3000/api/db-test',
    method: 'GET',
    expectedStatus: 200
  },
  {
    name: 'Hello API',
    url: 'http://localhost:3000/api/hello',
    method: 'GET',
    expectedStatus: 200
  },
  {
    name: 'Profile API (Unauthenticated)',
    url: 'http://localhost:3000/api/profile',
    method: 'GET',
    expectedStatus: 401
  },
  {
    name: 'Auth Signin API',
    url: 'http://localhost:3000/api/auth/signin',
    method: 'POST',
    data: { email: 'test@example.com', password: 'test' },
    expectedStatus: 200
  },
  {
    name: 'Auth Signup API',
    url: 'http://localhost:3000/api/auth/signup',
    method: 'POST',
    data: { email: 'new@example.com', password: 'test', fullname: 'New User' },
    expectedStatus: 200
  },
  {
    name: 'Progress Sync API',
    url: 'http://localhost:3000/api/progress/sync',
    method: 'POST',
    data: { dayId: 1, currentSlide: 0 },
    expectedStatus: 200
  }
];

// Run API tests
async function runApiTests() {
  console.log('📋 Running API Endpoint Tests\n');

  for (const test of apiTests) {
    try {
      console.log(`Testing ${test.name}...`);
      const response = await makeRequest(test.url, {
        method: test.method,
        data: test.data
      });

      const statusMatch = response.status === test.expectedStatus;

      if (statusMatch) {
        logTest(test.name, true, `Status ${response.status}`);

        // Try to parse JSON response
        try {
          const jsonResponse = JSON.parse(response.data);
          if (jsonResponse.success !== undefined) {
            console.log(`   Response: ${jsonResponse.success ? 'Success' : 'Failed'}`);
            if (jsonResponse.message) {
              console.log(`   Message: ${jsonResponse.message}`);
            }
          }
        } catch (e) {
          // Not JSON, ignore
        }
      } else {
        logTest(test.name, false, `Expected ${test.expectedStatus}, got ${response.status}`);
      }

      // Add small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      logTest(test.name, false, `Request failed: ${error.message}`);
    }
  }
}

// Test database integration status
async function testDatabaseIntegration() {
  console.log('\n📋 Testing Database Integration Status\n');

  try {
    // Test connection
    const connectionResponse = await makeRequest('http://localhost:3000/api/test-connection');
    if (connectionResponse.status === 200) {
      const connectionData = JSON.parse(connectionResponse.data);
      logTest('Database Connection', connectionData.success,
        connectionData.success ? 'Connected successfully' : 'Connection failed');

      if (connectionData.data) {
        console.log(`   User count: ${connectionData.data.userCount}`);
        console.log(`   Tables: ${connectionData.data.tables.join(', ')}`);
      }
    } else {
      logTest('Database Connection', false, `Status ${connectionResponse.status}`);
    }

    // Test tables
    const tablesResponse = await makeRequest('http://localhost:3000/api/check-tables');
    if (tablesResponse.status === 200) {
      const tablesData = JSON.parse(tablesResponse.data);

      let accessibleTables = 0;
      let totalTables = 0;

      Object.keys(tablesData).forEach(tableName => {
        const table = tablesData[tableName];
        if (table.accessible) {
          accessibleTables++;
        }
        totalTables++;
      });

      logTest('Database Tables', accessibleTables > 0,
        `${accessibleTables}/${totalTables} tables accessible`);
    } else {
      logTest('Database Tables', false, `Status ${tablesResponse.status}`);
    }

    // Test comprehensive DB test
    const dbTestResponse = await makeRequest('http://localhost:3000/api/db-test');
    if (dbTestResponse.status === 200) {
      const dbTestData = JSON.parse(dbTestResponse.data);
      logTest('Comprehensive DB Test', dbTestData.success,
        dbTestData.success ? 'All tests passed' : 'Some tests failed');

      if (dbTestData.tests) {
        dbTestData.tests.forEach(test => {
          console.log(`   ${test.name}: ${test.status}`);
        });
      }
    } else {
      logTest('Comprehensive DB Test', false, `Status ${dbTestResponse.status}`);
    }

  } catch (error) {
    logTest('Database Integration', false, `Test failed: ${error.message}`);
  }
}

// Test RLS policies
async function testRLSPolicies() {
  console.log('\n📋 Testing RLS Policies\n');

  try {
    // Test if we can access data without authentication
    const progressResponse = await makeRequest('http://localhost:3000/api/progress');
    if (progressResponse.status === 200) {
      const progressData = JSON.parse(progressResponse.data);

      // Check if we got anonymous data
      if (progressData.currentDay !== undefined) {
        logTest('RLS - Anonymous Access', true, 'Anonymous access working (demo mode)');
      } else {
        logTest('RLS - Anonymous Access', false, 'Unexpected response structure');
      }
    } else {
      logTest('RLS - Anonymous Access', false, `Status ${progressResponse.status}`);
    }

    // Test creating user without authentication
    const createUserResponse = await makeRequest('http://localhost:3000/api/create-user', {
      method: 'POST',
      data: {
        fullname: 'RLS Test User',
        email: `rls-test-${Date.now()}@example.com`,
        phone: '5555555555',
        profession: 'student',
        organization: 'RLS Test Org'
      }
    });

    if (createUserResponse.status === 200) {
      const createUserData = JSON.parse(createUserResponse.data);
      if (createUserData.success) {
        logTest('RLS - User Creation', true, 'User creation allowed');
      } else {
        logTest('RLS - User Creation', false, 'User creation failed');
      }
    } else {
      logTest('RLS - User Creation', false, `Status ${createUserResponse.status}`);
    }

  } catch (error) {
    logTest('RLS Policies', false, `Test failed: ${error.message}`);
  }
}

// Run all tests
async function runAllTests() {
  try {
    await runApiTests();
    await testDatabaseIntegration();
    await testRLSPolicies();

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
      console.log('🟢 Database integration is working well');
    } else if (passRate >= 60) {
      console.log('🟡 Database integration has some issues');
    } else {
      console.log('🔴 Database integration needs attention');
    }

    console.log(`Pass rate: ${passRate.toFixed(1)}%`);

    // Specific recommendations
    console.log('\n💡 Recommendations');
    console.log('=================');

    if (results.failed.length > 0) {
      console.log('1. Address failed API endpoints');
    }

    if (passRate < 80) {
      console.log('2. Review database configuration and RLS policies');
    }

    console.log('3. Test with real user authentication when available');
    console.log('4. Monitor error logs for database issues');

    process.exit(results.failed.length > 5 ? 1 : 0);

  } catch (error) {
    console.error('Test execution failed:', error);
    process.exit(1);
  }
}

// Run the tests
runAllTests();