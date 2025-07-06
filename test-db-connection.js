#!/usr/bin/env node

const mongoose = require('mongoose');

// Test MongoDB Atlas connection
const testConnection = async () => {
  const mongoURIs = [
    'mongodb+srv://testuser:testpass123@cluster0.mongodb.net/parlour-admin?retryWrites=true&w=majority',
    'mongodb://localhost:27017/parlour_dashboard'
  ];

  console.log('🧪 Testing MongoDB connections...\n');

  for (const uri of mongoURIs) {
    try {
      console.log(`Testing: ${uri.includes('mongodb.net') ? 'MongoDB Atlas' : 'Local MongoDB'}`);
      
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      
      console.log('✅ Connection successful!');
      
      // Test basic operations
      const testSchema = new mongoose.Schema({ name: String });
      const TestModel = mongoose.model('Test', testSchema);
      
      await TestModel.create({ name: 'test' });
      console.log('✅ Write operation successful!');
      
      await TestModel.findOne({ name: 'test' });
      console.log('✅ Read operation successful!');
      
      await TestModel.deleteOne({ name: 'test' });
      console.log('✅ Delete operation successful!');
      
      console.log(`\n🎉 ${uri.includes('mongodb.net') ? 'MongoDB Atlas' : 'Local MongoDB'} is working perfectly!\n`);
      
      await mongoose.disconnect();
      return uri;
      
    } catch (error) {
      console.log(`❌ Connection failed: ${error.message}\n`);
      try {
        await mongoose.disconnect();
      } catch (e) {
        // Ignore disconnect errors
      }
      continue;
    }
  }
  
  console.log('❌ No working MongoDB connection found');
  return null;
};

testConnection().then(workingUri => {
  if (workingUri) {
    console.log('✅ Database connection test completed successfully!');
    console.log(`Working URI: ${workingUri}`);
  } else {
    console.log('❌ Database connection test failed');
    console.log('\n📝 To fix this:');
    console.log('1. Set up MongoDB Atlas at https://cloud.mongodb.com');
    console.log('2. Or install MongoDB locally');
    console.log('3. Update the MONGODB_URI in backend-parlour-api/.env');
  }
  process.exit(0);
}).catch(error => {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
}); 