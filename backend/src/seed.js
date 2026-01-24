import User from './models/User.js';

export const seedAdmin = async () => {
  try {
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount === 0) {
      const admin = new User({
        email: 'admin@store.com',
        password: 'admin123',
        role: 'admin'
      });
      await admin.save();
      console.log('✅ Default Admin created: admin@store.com / admin123');
    }
  } catch (error) {
    console.error('❌ Failed to seed admin:', error);
  }
};
