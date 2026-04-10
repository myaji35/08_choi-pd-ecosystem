/**
 * Script to create default admin user in Clerk
 * Run: node scripts/create-admin.js
 */

const https = require('https');

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
if (!CLERK_SECRET_KEY) {
  console.error('❌ CLERK_SECRET_KEY 환경변수가 설정되지 않았습니다.');
  process.exit(1);
}
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@choipd.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
if (!ADMIN_PASSWORD) {
  console.error('❌ ADMIN_PASSWORD 환경변수가 설정되지 않았습니다.');
  process.exit(1);
}

function createUser() {
  const data = JSON.stringify({
    email_address: [ADMIN_EMAIL],
    password: ADMIN_PASSWORD,
    first_name: 'Admin',
    last_name: 'User',
    skip_password_checks: true,
    skip_password_requirement: false,
  });

  const options = {
    hostname: 'api.clerk.com',
    port: 443,
    path: '/v1/users',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
      'Content-Type': 'application/json',
      'Content-Length': data.length,
    },
  };

  const req = https.request(options, (res) => {
    let body = '';

    res.on('data', (chunk) => {
      body += chunk;
    });

    res.on('end', () => {
      if (res.statusCode === 200 || res.statusCode === 201) {
        console.log('✅ Admin user created successfully!');
        console.log('Email:', ADMIN_EMAIL);
        console.log('Password:', ADMIN_PASSWORD);
        console.log('\nYou can now login at:');
        console.log('- Local: http://localhost:3011/admin/login');
        console.log('- Production: https://choi-pd-ecosystem-l4kjszfzd-myaji35s-projects.vercel.app/admin/login');
      } else if (res.statusCode === 422) {
        console.log('ℹ️  User already exists!');
        console.log('Email:', ADMIN_EMAIL);
        console.log('Password:', ADMIN_PASSWORD);
      } else {
        console.error('❌ Error creating user:');
        console.error('Status:', res.statusCode);
        console.error('Response:', body);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request error:', error);
  });

  req.write(data);
  req.end();
}

console.log('Creating admin user in Clerk...\n');
createUser();
