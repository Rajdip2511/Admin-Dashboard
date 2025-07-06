#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Updating MongoDB URI to use Atlas...\n');

// Backend .env file
const backendEnvPath = path.join(__dirname, 'backend-parlour-api', '.env');

// MongoDB Atlas connection string (replace with your actual connection string)
const atlasUri = 'mongodb+srv://admin:admin123@cluster0.mongodb.net/parlour-admin?retryWrites=true&w=majority';

const backendEnvContent = `NODE_ENV=development
PORT=5000
MONGODB_URI=${atlasUri}
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random-for-security
CORS_ORIGIN=http://localhost:3000`;

try {
  // Update backend .env
  fs.writeFileSync(backendEnvPath, backendEnvContent);
  console.log('✅ Updated backend/.env file with MongoDB Atlas URI');
  
  console.log('\n📝 MongoDB Atlas Setup:');
  console.log('1. Go to https://cloud.mongodb.com');
  console.log('2. Create a free account if you don\'t have one');
  console.log('3. Create a new cluster (free tier)');
  console.log('4. Create a database user:');
  console.log('   - Username: admin');
  console.log('   - Password: admin123');
  console.log('5. Add your IP address to the whitelist (or use 0.0.0.0/0 for all IPs)');
  console.log('6. Get your connection string and replace the one in backend-parlour-api/.env');
  console.log('');
  console.log('🎉 Configuration updated! Now restart your backend server.');

} catch (error) {
  console.error('❌ Error during update:', error.message);
  process.exit(1);
} 