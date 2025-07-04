// MongoDB initialization script for parlour dashboard
// This script will be executed when the MongoDB container starts

// Switch to parlour_dashboard database
db = db.getSiblingDB('parlour_dashboard');

// Create collections with initial data
db.createCollection('users');
db.createCollection('employees');
db.createCollection('tasks');
db.createCollection('attendances');

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.users.createIndex({ isActive: 1 });

db.employees.createIndex({ employeeId: 1 }, { unique: true });
db.employees.createIndex({ email: 1 }, { unique: true });
db.employees.createIndex({ department: 1 });
db.employees.createIndex({ position: 1 });
db.employees.createIndex({ isActive: 1 });

db.tasks.createIndex({ assignedTo: 1 });
db.tasks.createIndex({ assignedBy: 1 });
db.tasks.createIndex({ status: 1 });
db.tasks.createIndex({ priority: 1 });
db.tasks.createIndex({ dueDate: 1 });

db.attendances.createIndex({ employeeId: 1 });
db.attendances.createIndex({ date: 1 });
db.attendances.createIndex({ employeeId: 1, date: 1 }, { unique: true });

print('✅ Parlour Dashboard database initialized successfully!');
print('📊 Collections and indexes created.');
print('🔗 Database is ready for the application.');

// Note: Default users will be created by the application on first startup
// This is because we need to hash passwords using bcrypt, which requires the Node.js environment 