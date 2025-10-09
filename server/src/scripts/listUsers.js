const mongoose = require('mongoose');
const User = require('../models/User');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function listUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const users = await User.find({}, 'name email role createdAt').sort({ createdAt: -1 });
    
    console.log(`\n📋 Found ${users.length} users:\n`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Created: ${user.createdAt.toLocaleDateString()}`);
      console.log('');
    });

    if (users.length === 0) {
      console.log('❌ No users found. You need to register an account first.');
    } else {
      console.log('💡 You can login with any of these accounts to see the payment data.');
      console.log('💡 The seeded payments are associated with the first client user found.');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('📤 Disconnected from MongoDB');
    process.exit(0);
  }
}

listUsers();
