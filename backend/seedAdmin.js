const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');
dotenv.config({ path: './config/config.env' });

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const email = 'admin@kurtis2025.com';
    const password = 'admin123';
    const existing = await User.findOne({ email });
    if (existing) {
      existing.role = 'admin';
      existing.password = password;
      await existing.save();
      console.log('Admin user updated.');
    } else {
      await User.create({ name: 'Admin', email, password, role: 'admin' });
      console.log('Admin user created.');
    }
  } catch (err) {
    console.error('Error seeding admin user:', err);
  } finally {
    mongoose.disconnect();
  }
}
seedAdmin(); 