/**
 * Script to delete old admin and create new one with strong password
 * Run: node scripts/reset-admin.js
 */

const https = require('https');

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
if (!CLERK_SECRET_KEY) {
  console.error('❌ CLERK_SECRET_KEY 환경변수가 설정되지 않았습니다.');
  process.exit(1);
}
const OLD_EMAIL = process.env.ADMIN_OLD_EMAIL || 'admin@test.com';
const NEW_EMAIL = process.env.ADMIN_EMAIL || 'admin@choipd.com';
const NEW_PASSWORD = process.env.ADMIN_PASSWORD;
if (!NEW_PASSWORD) {
  console.error('❌ ADMIN_PASSWORD 환경변수가 설정되지 않았습니다.');
  process.exit(1);
}

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, body: body });
      });
    });

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function getUserByEmail(email) {
  const options = {
    hostname: 'api.clerk.com',
    path: `/v1/users?email_address=${encodeURIComponent(email)}`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
    },
  };

  const result = await makeRequest(options);
  if (result.statusCode === 200) {
    const users = JSON.parse(result.body);
    return users.length > 0 ? users[0] : null;
  }
  return null;
}

async function deleteUser(userId) {
  const options = {
    hostname: 'api.clerk.com',
    path: `/v1/users/${userId}`,
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
    },
  };

  return await makeRequest(options);
}

async function createUser(email, password) {
  const data = JSON.stringify({
    email_address: [email],
    password: password,
    first_name: 'Admin',
    last_name: 'ChoiPD',
    skip_password_checks: true,
    skip_password_requirement: false,
  });

  const options = {
    hostname: 'api.clerk.com',
    path: '/v1/users',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
      'Content-Type': 'application/json',
      'Content-Length': data.length,
    },
  };

  return await makeRequest(options, data);
}

async function main() {
  console.log('🔄 Resetting admin account...\n');

  // Delete old user if exists
  console.log('Checking for old admin account...');
  const oldUser = await getUserByEmail(OLD_EMAIL);
  if (oldUser) {
    console.log(`Found old user: ${OLD_EMAIL}, deleting...`);
    await deleteUser(oldUser.id);
    console.log('✅ Old user deleted\n');
  } else {
    console.log('No old user found\n');
  }

  // Delete new user if exists (in case of retry)
  const existingNewUser = await getUserByEmail(NEW_EMAIL);
  if (existingNewUser) {
    console.log(`Found existing ${NEW_EMAIL}, deleting...`);
    await deleteUser(existingNewUser.id);
    console.log('✅ Existing user deleted\n');
  }

  // Create new user
  console.log('Creating new admin account...');
  const result = await createUser(NEW_EMAIL, NEW_PASSWORD);

  if (result.statusCode === 200 || result.statusCode === 201) {
    console.log('✅ Admin account created successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:    ', NEW_EMAIL);
    console.log('🔒 Password: [설정된 환경변수 ADMIN_PASSWORD 사용]');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🌐 Login URLs:');
    console.log('   Local:      http://localhost:3011/admin/login');
    console.log('   Production: https://choi-pd-ecosystem-l4kjszfzd-myaji35s-projects.vercel.app/admin/login');
  } else {
    console.error('❌ Error creating user:');
    console.error('Status:', result.statusCode);
    console.error('Response:', result.body);
  }
}

main().catch(console.error);
