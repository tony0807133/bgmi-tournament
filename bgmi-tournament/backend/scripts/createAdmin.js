require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function createAdmin() {
  await mongoose.connect(process.env.MONGODB_URI);
  const hashed = await bcrypt.hash('admin123', 10);
  const admin = await User.findOneAndUpdate(
    { email: 'admin@bgmi.com' },
    {
      name: 'Admin',
      email: 'admin@bgmi.com',
      password: hashed,
      phone: '9999999999',
      bgmiId: 'ADMIN001',
      bgmiName: 'Admin',
      role: 'admin',
      wallet: 0
    },
    { upsert: true, new: true }
  );
  console.log('✅ Admin ready:', admin.email, '| role:', admin.role);
  await mongoose.disconnect();
}

createAdmin().catch(console.error);
