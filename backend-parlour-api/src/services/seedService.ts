import mongoose from 'mongoose';
import connectDB from '../config/database';
import User from '../models/User';
import Employee from '../models/Employee';
import Task from '../models/Task';
import { UserRole, TaskStatus, TaskPriority } from '../types';

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Task.deleteMany({});
    await Employee.deleteMany({});
    await User.deleteMany({});

    console.log('Cleared existing data.');

    // Create Super Admin
    const superAdmin = new User({
      email: 'superadmin@parlour.com',
      password: 'password123',
      firstName: 'Super',
      lastName: 'Admin',
      role: UserRole.SUPER_ADMIN,
    });
    await superAdmin.save();

    // Create Admin
    const admin = new User({
      email: 'admin@parlour.com',
      password: 'password123',
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
    });
    await admin.save();

    // Create Employees
    const employeeUser1 = new User({
        email: 'employee1@parlour.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.ADMIN,
    });
    await employeeUser1.save();
    const employee1 = new Employee({
        employeeId: 'EMP001',
        user: employeeUser1._id,
        firstName: 'John',
        lastName: 'Doe',
        email: 'employee1@parlour.com',
        phone: '123-456-7890',
        position: 'Stylist'
    });
    await employee1.save();

    const employeeUser2 = new User({
        email: 'employee2@parlour.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Smith',
        role: UserRole.ADMIN,
    });
    await employeeUser2.save();
    const employee2 = new Employee({
        employeeId: 'EMP002',
        user: employeeUser2._id,
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'employee2@parlour.com',
        phone: '098-765-4321',
        position: 'Manager'
    });
    await employee2.save();

    console.log('Created users and employees.');

    // Create Tasks
    const task1 = new Task({
        title: 'Clean the main floor',
        description: 'Sweep and mop the main floor area.',
        assignedTo: employee1._id,
        assignedBy: superAdmin._id,
        status: TaskStatus.PENDING,
        priority: TaskPriority.MEDIUM,
        dueDate: new Date(new Date().setDate(new Date().getDate() + 3)),
    });
    await task1.save();

    const task2 = new Task({
        title: 'Restock inventory',
        description: 'Check and restock all hair products.',
        assignedTo: employee2._id,
        assignedBy: superAdmin._id,
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        dueDate: new Date(new Date().setDate(new Date().getDate() + 1)),
    });
    await task2.save();

    console.log('Seeding completed successfully!');
    return { success: true, message: 'Database seeded successfully' };
  } catch (error) {
    console.error('Error seeding database:', error);
    return { success: false, message: 'Error seeding database' };
  } finally {
    mongoose.disconnect();
  }
};

export default seedDatabase; 