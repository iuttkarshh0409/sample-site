const http = require('http');

function post(url, data) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const postData = JSON.stringify(data);
    const options = {
      hostname: u.hostname,
      port: u.port,
      path: u.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: JSON.parse(body)
        });
      });
    });

    req.on('error', (e) => reject(e));
    req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING BACKEND API TESTS ---');
  
  // Test 1: Invalid Email Format
  try {
    const res = await post('http://localhost:3000/api/auth/login', { email: 'invalid-email-format' });
    console.log(`Test 1 (Invalid Email): Status ${res.statusCode}`);
    console.log('Response body:', res.body);
    if (res.statusCode === 400 && res.body.status === 'error') {
      console.log('✅ Test 1 Passed: Invalid email successfully rejected.');
    } else {
      console.log('❌ Test 1 Failed');
    }
  } catch (err) {
    console.error('Test 1 Error:', err);
  }

  // Test 2: New User Signup
  let firstUserId = null;
  const testEmail = `test_${Date.now()}@example.com`;
  try {
    const res = await post('http://localhost:3000/api/auth/login', { email: testEmail });
    console.log(`\nTest 2 (New User Signup): Status ${res.statusCode}`);
    console.log('Response body:', res.body);
    if (res.statusCode === 201 && res.body.action === 'signup' && res.body.user.email === testEmail) {
      firstUserId = res.body.user.id;
      console.log(`✅ Test 2 Passed: User created with ID: ${firstUserId}`);
    } else {
      console.log('❌ Test 2 Failed');
    }
  } catch (err) {
    console.error('Test 2 Error:', err);
  }

  // Test 3: Existing User Login (same email)
  try {
    const res = await post('http://localhost:3000/api/auth/login', { email: testEmail });
    console.log(`\nTest 3 (Existing User Login): Status ${res.statusCode}`);
    console.log('Response body:', res.body);
    if (res.statusCode === 200 && res.body.action === 'login' && res.body.user.id === firstUserId) {
      console.log('✅ Test 3 Passed: Existing user recognized and logged in without duplicates.');
    } else {
      console.log('❌ Test 3 Failed');
    }
  } catch (err) {
    console.error('Test 3 Error:', err);
  }

  console.log('\n--- TESTS COMPLETED ---');
}

runTests();
