import User from '@/models/User';
import { UserRole } from '@/types';

export class SeedService {
  public static async seedDefaultUsers(): Promise<void> {
    try {
      console.log('🌱 Checking for default users...');

      // Check if any users exist
      const userCount = await User.countDocuments();
      
      if (userCount > 0) {
        console.log('📊 Users already exist in database, skipping seeding');
        return;
      }

      console.log('👤 Creating default users...');

      // Create Super Admin
      const superAdminEmail = process.env['DEFAULT_SUPER_ADMIN_EMAIL'] || 'admin@parlour.com';
      const superAdminPassword = process.env['DEFAULT_SUPER_ADMIN_PASSWORD'] || 'Admin@123';

      const superAdmin = new User({
        email: superAdminEmail,
        password: superAdminPassword,
        firstName: 'Super',
        lastName: 'Admin',
        role: UserRole.SUPER_ADMIN,
        isActive: true
      });

      await superAdmin.save();
      console.log(`✅ Super Admin created: ${superAdminEmail}`);

      // Create Regular Admin
      const adminEmail = process.env['DEFAULT_ADMIN_EMAIL'] || 'manager@parlour.com';
      const adminPassword = process.env['DEFAULT_ADMIN_PASSWORD'] || 'Manager@123';

      const admin = new User({
        email: adminEmail,
        password: adminPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: UserRole.ADMIN,
        isActive: true
      });

      await admin.save();
      console.log(`✅ Admin created: ${adminEmail}`);

      console.log('🎉 Default users seeded successfully!');
      console.log('');
      console.log('📋 Default Credentials:');
      console.log(`🔑 Super Admin: ${superAdminEmail} / ${superAdminPassword}`);
      console.log(`🔑 Admin: ${adminEmail} / ${adminPassword}`);
      console.log('');

    } catch (error) {
      console.error('❌ Error seeding default users:', error);
      throw error;
    }
  }

  public static async seedSampleEmployees(): Promise<void> {
    try {
      console.log('🌱 Checking for sample employees...');

      // We'll implement this later when we have the Employee model properly set up
      // For now, we'll just log that this is available
      console.log('📊 Employee seeding will be available after employee management is complete');

    } catch (error) {
      console.error('❌ Error seeding sample employees:', error);
      throw error;
    }
  }

  public static async seedAll(): Promise<void> {
    try {
      console.log('🌱 Starting database seeding...');
      
      await this.seedDefaultUsers();
      // await this.seedSampleEmployees(); // Uncomment when ready
      
      console.log('✅ Database seeding completed!');
    } catch (error) {
      console.error('❌ Database seeding failed:', error);
      throw error;
    }
  }
}

export default SeedService; 