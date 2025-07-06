#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Testing Parlour Admin Dashboard setup...\n');

// Check if environment files exist
const backendEnvPath = path.join(__dirname, 'backend-parlour-api', '.env');
const frontendEnvPath = path.join(__dirname, 'frontend-parlour-dashboard', '.env.local');

console.log('📁 Checking environment files:');
console.log(`Backend .env: ${fs.existsSync(backendEnvPath) ? '✅ Found' : '❌ Missing'}`);
console.log(`Frontend .env.local: ${fs.existsSync(frontendEnvPath) ? '✅ Found' : '❌ Missing'}`);

// Check if node_modules exist
const backendNodeModules = path.join(__dirname, 'backend-parlour-api', 'node_modules');
const frontendNodeModules = path.join(__dirname, 'frontend-parlour-dashboard', 'node_modules');

console.log('\n📦 Checking dependencies:');
console.log(`Backend node_modules: ${fs.existsSync(backendNodeModules) ? '✅ Installed' : '❌ Missing'}`);
console.log(`Frontend node_modules: ${fs.existsSync(frontendNodeModules) ? '✅ Installed' : '❌ Missing'}`);

// Check backend .env content
if (fs.existsSync(backendEnvPath)) {
  const envContent = fs.readFileSync(backendEnvPath, 'utf8');
  console.log('\n🔧 Backend environment variables:');
  console.log(`NODE_ENV: ${envContent.includes('NODE_ENV') ? '✅' : '❌'}`);
  console.log(`PORT: ${envContent.includes('PORT') ? '✅' : '❌'}`);
  console.log(`MONGODB_URI: ${envContent.includes('MONGODB_URI') ? '✅' : '❌'}`);
  console.log(`JWT_SECRET: ${envContent.includes('JWT_SECRET') ? '✅' : '❌'}`);
  console.log(`CORS_ORIGIN: ${envContent.includes('CORS_ORIGIN') ? '✅' : '❌'}`);
  
  if (envContent.includes('mongodb+srv://test:test@cluster0.mongodb.net')) {
    console.log('\n⚠️  WARNING: Using temporary MongoDB URI');
    console.log('   Please set up MongoDB Atlas and update MONGODB_URI in backend-parlour-api/.env');
  }
}

// Check frontend .env content
if (fs.existsSync(frontendEnvPath)) {
  const envContent = fs.readFileSync(frontendEnvPath, 'utf8');
  console.log('\n🌐 Frontend environment variables:');
  console.log(`NEXT_PUBLIC_API_URL: ${envContent.includes('NEXT_PUBLIC_API_URL') ? '✅' : '❌'}`);
  console.log(`NEXT_PUBLIC_SOCKET_URL: ${envContent.includes('NEXT_PUBLIC_SOCKET_URL') ? '✅' : '❌'}`);
}

console.log('\n🚀 Next steps:');
console.log('1. Set up MongoDB Atlas (see instructions above)');
console.log('2. Update MONGODB_URI in backend-parlour-api/.env');
console.log('3. Run: npm run dev');
console.log('4. Visit: http://localhost:3000');

console.log('\n📋 Default login credentials:');
console.log('Super Admin: superadmin@parlour.com / password123');
console.log('Admin: admin@parlour.com / password123');
console.log('Employee: john.doe@parlour.com / password123'); 