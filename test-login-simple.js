#!/usr/bin/env node

console.log('🧪 Testing login endpoint...\n');

const testLogin = async () => {
  try {
    const fetch = (await import('node-fetch')).default;
    
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'superadmin@parlour.com',
        password: 'password123'
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Login successful!');
      console.log('Response:', JSON.stringify(data, null, 2));
    } else {
      console.log('❌ Login failed!');
      console.log('Status:', response.status);
      console.log('Error:', JSON.stringify(data, null, 2));
    }
    
  } catch (error) {
    console.log('❌ Request failed!');
    console.log('Error:', error.message);
  }
};

testLogin(); 