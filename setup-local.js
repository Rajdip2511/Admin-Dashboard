#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Parlour Admin Dashboard for local development...\n');

// Backend .env file
const backendEnvPath = path.join(__dirname, 'backend-parlour-api', '.env');
const backendEnvContent = `NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/parlour-admin
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random-for-security
CORS_ORIGIN=http://localhost:3000`;

// Frontend .env.local file
const frontendEnvPath = path.join(__dirname, 'frontend-parlour-dashboard', '.env.local');
const frontendEnvContent = `NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000`;

try {
  // Create backend .env
  fs.writeFileSync(backendEnvPath, backendEnvContent);
  console.log('✅ Created backend/.env file');

  // Create frontend .env.local
  fs.writeFileSync(frontendEnvPath, frontendEnvContent);
  console.log('✅ Created frontend/.env.local file');

  console.log('\n📝 Next steps:');
  console.log('1. Set up MongoDB Atlas (cloud database):');
  console.log('   - Go to https://cloud.mongodb.com');
  console.log('   - Create a free account and cluster');
  console.log('   - Get your connection string');
  console.log('   - Replace MONGODB_URI in backend-parlour-api/.env');
  console.log('');
  console.log('2. Install dependencies and start the application:');
  console.log('   npm run setup');
  console.log('   npm run dev');
  console.log('');
  console.log('🎉 Setup complete! Your application will be available at:');
  console.log('   Frontend: http://localhost:3000');
  console.log('   Backend: http://localhost:5000');
  console.log('   API Docs: http://localhost:5000/api-docs');

} catch (error) {
  console.error('❌ Error during setup:', error.message);
  process.exit(1);
} 