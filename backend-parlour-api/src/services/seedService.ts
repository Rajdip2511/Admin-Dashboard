import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { UserRole } from '../types';
import connectDB from '../config/database';

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('[Seed] Database connected...');

    const existingSuperAdmin = await User.findOne({ email: 'admin@parlour.com' });
    const existingAdmin = await User.findOne({ email: 'manager@parlour.com' });

    if (!existingSuperAdmin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Admin@123', salt);
      const superAdmin = new User({
        email: 'admin@parlour.com',
        password: hashedPassword,
        role: UserRole.SUPER_ADMIN,
        firstName: 'Super',
        lastName: 'Admin'
      });
      await superAdmin.save();
      console.log('[Seed] Super Admin created.');
    } else {
      console.log('[Seed] Super Admin already exists.');
    }

    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Manager@123', salt);
      const admin = new User({
        email: 'manager@parlour.com',
        password: hashedPassword,
        role: UserRole.ADMIN,
        firstName: 'Site',
        lastName: 'Manager'
      });
      await admin.save();
      console.log('[Seed] Admin created.');
    } else {
      console.log('[Seed] Admin already exists.');
    }
    return { success: true, message: 'Database seeded successfully.' };
  } catch (error) {
    console.error('[Seed] Error seeding users:', error);
    return { success: false, message: 'Error seeding database.' };
  } finally {
    mongoose.disconnect();
    console.log('[Seed] Database disconnected.');
  }
};

seedDatabase();

export default seedDatabase; 