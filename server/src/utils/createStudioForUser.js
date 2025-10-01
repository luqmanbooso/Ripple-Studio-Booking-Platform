const mongoose = require('mongoose');
const User = require('../models/User');
const Studio = require('../models/Studio');
require('dotenv').config();

const createStudioForUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find the user without studio
    const user = await User.findOne({ email: 'dsasd@gmail.com' });
    
    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }

    console.log(`Found user: ${user.email}`);

    if (user.studio) {
      console.log('✅ User already has a studio');
      process.exit(0);
    }

    // Create studio for this user
    const studio = await Studio.create({
      user: user._id,
      name: `${user.name}'s Recording Studio`,
      description: 'Professional recording studio with modern equipment',
      location: {
        country: 'Sri Lanka',
        city: user.city || 'Colombo',
        address: '123 Music Avenue'
      },
      equipment: ['Microphones', 'Audio Interface', 'Studio Monitors', 'Headphones'],
      services: [
        {
          name: 'Recording Session',
          price: 150,
          durationMins: 180,
          description: 'Professional recording session with engineer'
        },
        {
          name: 'Mixing & Mastering',
          price: 100,
          durationMins: 120,
          description: 'Professional mixing and mastering service'
        }
      ],
      isApproved: true,
      availability: {
        schedule: []
      }
    });

    // Link studio to user
    user.studio = studio._id;
    await user.save();

    console.log(`✅ Created studio: ${studio.name}`);
    console.log(`✅ Studio ID: ${studio._id}`);
    console.log(`\n✅ You can now login with:`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Password: [your password]`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createStudioForUser();
