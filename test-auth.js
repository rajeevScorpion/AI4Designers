import fetch from 'node-fetch';

// Test the authentication API endpoints
async function testAuth() {
  const baseUrl = 'http://localhost:5000';

  console.log('Testing authentication endpoints...\n');

  // Test 1: Try to access protected endpoint without authentication
  console.log('1. Testing access without authentication...');
  try {
    const response = await fetch(`${baseUrl}/api/auth/user`);
    console.log(`Status: ${response.status}`);
    const data = await response.json();
    console.log('Response:', data.message);
  } catch (error) {
    console.error('Error:', error.message);
  }
  console.log('');

  // Test 2: Sign in with valid credentials
  console.log('2. Testing sign in with valid credentials...');
  try {
    const response = await fetch(`${baseUrl}/api/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: '123456'
      }),
    });

    console.log(`Status: ${response.status}`);
    const data = await response.json();

    if (response.ok) {
      console.log('✅ Sign in successful!');
      console.log('User ID:', data.user.id);
      console.log('Email:', data.user.email);

      // Test 3: Access protected endpoint with token
      console.log('\n3. Testing access with authentication token...');
      const userResponse = await fetch(`${baseUrl}/api/auth/user`, {
        headers: {
          'Authorization': `Bearer ${data.session.access_token}`,
        },
      });

      console.log(`Status: ${userResponse.status}`);
      if (userResponse.ok) {
        const userData = await userResponse.json();
        console.log('✅ Successfully accessed protected endpoint');
        console.log('User data:', userData.email);
      } else {
        console.log('❌ Failed to access protected endpoint');
      }
    } else {
      console.log('❌ Sign in failed:', data.message);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
  console.log('');

  // Test 4: Sign in with invalid credentials
  console.log('4. Testing sign in with invalid credentials...');
  try {
    const response = await fetch(`${baseUrl}/api/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'invalid@example.com',
        password: 'wrongpassword'
      }),
    });

    console.log(`Status: ${response.status}`);
    const data = await response.json();
    console.log('Response:', data.message);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the tests
testAuth().catch(console.error);