import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://mongodb:27017/parlour_dashboard';

const seedUsers = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('[DB] MongoDB connected for seeding...');

    const existingSuperAdmin = await User.findOne({ email: 'admin@parlour.com' });
    const existingAdmin = await User.findOne({ email: 'manager@parlour.com' });

    if (!existingSuperAdmin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Admin@123', salt);
      const superAdmin = new User({
        email: 'admin@parlour.com',
        password: hashedPassword,
        role: 'Super Admin',
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
        role: 'Admin',
      });
      await admin.save();
      console.log('[Seed] Admin created.');
    } else {
      console.log('[Seed] Admin already exists.');
    }
  } catch (error) {
    console.error('[Seed] Error seeding users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('[DB] MongoDB disconnected after seeding.');
  }
};

seedUsers(); 