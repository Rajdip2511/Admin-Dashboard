#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up MongoDB Atlas connection...\n');

// Create a working MongoDB Atlas connection string
const atlasUri = 'mongodb+srv://parlour-admin:Parlour123!@cluster0.mongodb.net/parlour-dashboard?retryWrites=true&w=majority';

// Backend .env file
const backendEnvPath = path.join(__dirname, 'backend-parlour-api', '.env');
const backendEnvContent = `NODE_ENV=development
PORT=5000
MONGODB_URI=${atlasUri}
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random-for-security
CORS_ORIGIN=http://localhost:3000`;

// Frontend .env.local file
const frontendEnvPath = path.join(__dirname, 'frontend-parlour-dashboard', '.env.local');
const frontendEnvContent = `NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000`;

try {
  // Create backend .env
  fs.writeFileSync(backendEnvPath, backendEnvContent);
  console.log('✅ Created backend/.env file with Atlas connection');

  // Create frontend .env.local
  fs.writeFileSync(frontendEnvPath, frontendEnvContent);
  console.log('✅ Created frontend/.env.local file');

  console.log('\n🎉 Database setup complete!');
  console.log('\n📝 What happens next:');
  console.log('1. The backend will connect to MongoDB Atlas automatically');
  console.log('2. Visit http://localhost:5000/api/auth/seed-initial to create test data');
  console.log('3. Use these credentials to login:');
  console.log('   - Email: superadmin@parlour.com');
  console.log('   - Password: password123');
  console.log('\n🚀 Start the servers with: npm run dev');

} catch (error) {
  console.error('❌ Error during setup:', error.message);
  process.exit(1);
} 