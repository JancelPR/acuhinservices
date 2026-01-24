import User from './models/User.js';
import Product from './models/Product.js';
import Category from './models/Category.js';

export const seedData = async () => {
  try {
    // 1. Seed Admin
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

    // 2. Seed Categories from existing products
    const categoryCount = await Category.countDocuments();
    if (categoryCount === 0) {
      console.log('📦 Seeding categories from products...');
      const products = await Product.find({}, 'category');
      const uniqueCategories = [...new Set(products.map(p => p.category))];
      
      if (uniqueCategories.length > 0) {
        const categoryDocs = uniqueCategories.map(name => ({ name }));
        await Category.insertMany(categoryDocs, { ordered: false }).catch(err => {
            // Ignore duplicate errors if some were somehow parallelly inserted
            if (err.code !== 11000) throw err;
        });
        console.log(`✅ Seeded ${uniqueCategories.length} categories.`);
      } else {
        // Seed some defaults if no products exist
        const defaults = ['Beverages', 'Snacks', 'Laundry', 'Personal Care', 'Miscellaneous'];
        await Category.insertMany(defaults.map(name => ({ name })));
        console.log(`✅ Seeded default categories.`);
      }
    }
  } catch (error) {
    console.error('❌ Failed to seed data:', error);
  }
};

// Keep old export for compatibility if needed, but we should update server.js
export const seedAdmin = seedData;
