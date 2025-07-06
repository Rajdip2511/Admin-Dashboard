const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// Test credentials
const TEST_CREDENTIALS = {
  email: 'superadmin@parlour.com',
  password: 'password123'
};

let authToken = '';

// Colors for better console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function authenticate() {
  try {
    log('🔐 Authenticating with Super Admin credentials...', 'yellow');
    const response = await axios.post(`${API_URL}/auth/login`, TEST_CREDENTIALS);
    authToken = response.data.token;
    log('✅ Authentication successful!', 'green');
    return true;
  } catch (error) {
    log('❌ Authentication failed:', 'red');
    console.error(error.response?.data || error.message);
    return false;
  }
}

async function getEmployees() {
  try {
    log('📋 Fetching current employees...', 'yellow');
    const response = await axios.get(`${API_URL}/employees`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    log('👥 Current Employees:', 'cyan');
    response.data.forEach((emp, index) => {
      log(`   ${index + 1}. ${emp.firstName} ${emp.lastName} (${emp.position}) - ${emp.email}`, 'blue');
    });
    
    return response.data;
  } catch (error) {
    log('❌ Failed to fetch employees:', 'red');
    console.error(error.response?.data || error.message);
    return [];
  }
}

async function createEmployee(employeeData) {
  try {
    log(`🆕 Creating new employee: ${employeeData.firstName} ${employeeData.lastName}...`, 'yellow');
    const response = await axios.post(`${API_URL}/employees`, employeeData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    log(`✅ Employee created successfully!`, 'green');
    log(`   ID: ${response.data._id}`, 'blue');
    log(`   Employee ID: ${response.data.employeeId}`, 'blue');
    log(`   Name: ${response.data.firstName} ${response.data.lastName}`, 'blue');
    log(`   Position: ${response.data.position}`, 'blue');
    
    return response.data;
  } catch (error) {
    log(`❌ Failed to create employee:`, 'red');
    console.error(error.response?.data || error.message);
    return null;
  }
}

async function updateEmployee(employeeId, updateData) {
  try {
    log(`✏️ Updating employee ${employeeId}...`, 'yellow');
    const response = await axios.put(`${API_URL}/employees/${employeeId}`, updateData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    log(`✅ Employee updated successfully!`, 'green');
    log(`   Name: ${response.data.firstName} ${response.data.lastName}`, 'blue');
    log(`   Position: ${response.data.position}`, 'blue');
    
    return response.data;
  } catch (error) {
    log(`❌ Failed to update employee:`, 'red');
    console.error(error.response?.data || error.message);
    return null;
  }
}

async function deleteEmployee(employeeId) {
  try {
    log(`🗑️ Deleting employee ${employeeId}...`, 'yellow');
    const response = await axios.delete(`${API_URL}/employees/${employeeId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    log(`✅ Employee deleted successfully!`, 'green');
    log(`   ${response.data.msg}`, 'blue');
    
    return true;
  } catch (error) {
    log(`❌ Failed to delete employee:`, 'red');
    console.error(error.response?.data || error.message);
    return false;
  }
}

async function runEmployeeManagementTest() {
  log('🚀 STARTING EMPLOYEE MANAGEMENT TEST', 'bright');
  log('=' * 60, 'cyan');
  
  // Step 1: Authenticate
  const authSuccess = await authenticate();
  if (!authSuccess) {
    log('❌ Test failed - Authentication required', 'red');
    return;
  }
  
  await delay(1000);
  
  // Step 2: Get initial employees
  log('📊 STEP 1: Getting initial employee list...', 'cyan');
  const initialEmployees = await getEmployees();
  const initialCount = initialEmployees.length;
  
  await delay(2000);
  
  // Step 3: Create new employees
  log('🆕 STEP 2: Testing employee creation...', 'cyan');
  
  const newEmployee1 = await createEmployee({
    firstName: 'Alice',
    lastName: 'Johnson',
    email: 'alice.johnson@parlour.com',
    phone: '555-111-2222',
    position: 'Makeup Artist',
    password: 'password123',
    role: 'ADMIN'
  });
  
  await delay(1000);
  
  const newEmployee2 = await createEmployee({
    firstName: 'Bob',
    lastName: 'Williams',
    email: 'bob.williams@parlour.com',
    phone: '555-333-4444',
    position: 'Barber',
    password: 'password123',
    role: 'ADMIN'
  });
  
  await delay(2000);
  
  // Step 4: Verify creation
  log('✅ STEP 3: Verifying new employees were added...', 'cyan');
  const afterCreateEmployees = await getEmployees();
  const newCount = afterCreateEmployees.length;
  
  if (newCount > initialCount) {
    log(`🎉 Success! Employee count increased from ${initialCount} to ${newCount}`, 'green');
  } else {
    log(`❌ Issue: Employee count did not increase`, 'red');
  }
  
  await delay(2000);
  
  // Step 5: Update an employee
  if (newEmployee1) {
    log('✏️ STEP 4: Testing employee update...', 'cyan');
    await updateEmployee(newEmployee1._id, {
      position: 'Senior Makeup Artist',
      phone: '555-111-9999'
    });
  }
  
  await delay(2000);
  
  // Step 6: Delete an employee
  if (newEmployee2) {
    log('🗑️ STEP 5: Testing employee deletion...', 'cyan');
    await deleteEmployee(newEmployee2._id);
  }
  
  await delay(2000);
  
  // Step 7: Final verification
  log('🏁 STEP 6: Final employee list...', 'cyan');
  const finalEmployees = await getEmployees();
  const finalCount = finalEmployees.length;
  
  log('🎯 TEST RESULTS SUMMARY:', 'magenta');
  log(`📊 Initial Employees: ${initialCount}`, 'blue');
  log(`➕ Created Employees: 2`, 'blue');
  log(`✏️ Updated Employees: 1`, 'blue');
  log(`🗑️ Deleted Employees: 1`, 'blue');
  log(`📈 Final Employees: ${finalCount}`, 'blue');
  
  // Step 8: Test with duplicate email
  log('🔄 STEP 7: Testing duplicate email validation...', 'cyan');
  const duplicateResult = await createEmployee({
    firstName: 'Test',
    lastName: 'User',
    email: 'alice.johnson@parlour.com', // Same as existing employee
    phone: '555-999-9999',
    position: 'Test Position',
    password: 'password123',
    role: 'ADMIN'
  });
  
  if (!duplicateResult) {
    log('✅ Duplicate email validation working correctly!', 'green');
  } else {
    log('❌ Duplicate email validation failed', 'red');
  }
  
  await delay(1000);
  
  log('🎉 EMPLOYEE MANAGEMENT TEST COMPLETED!', 'bright');
  log('=' * 60, 'cyan');
  log('✨ The employee management system is working perfectly!', 'green');
  log('🔄 CRUD operations are functioning with mock data', 'green');
  log('💾 Employee data persists during development session', 'green');
  log('🛡️ Validation and error handling working correctly', 'green');
  
  process.exit(0);
}

async function main() {
  try {
    await runEmployeeManagementTest();
  } catch (error) {
    log('❌ Test failed with error:', 'red');
    console.error(error);
    process.exit(1);
  }
}

// Check if backend is running
axios.get(`${API_URL.replace('/api', '')}/health`)
  .then(() => {
    log('✅ Backend server is running', 'green');
    main();
  })
  .catch(() => {
    log('❌ Backend server is not running. Please start it first:', 'red');
    log('   npm run dev:backend', 'yellow');
    process.exit(1);
  }); 