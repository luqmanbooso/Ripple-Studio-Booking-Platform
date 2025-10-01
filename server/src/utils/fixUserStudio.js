const mongoose = require('mongoose');
const User = require('../models/User');
const Studio = require('../models/Studio');
require('dotenv').config();

const fixUserStudio = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find studio users without studios
    const studioUsers = await User.find({ role: 'studio' });
    console.log(`Found ${studioUsers.length} studio users`);

    for (const user of studioUsers) {
      if (!user.studio) {
        console.log(`\n❌ User ${user.email} has no studio`);
        
        // Check if there's a studio for this user
        const studio = await Studio.findOne({ user: user._id });
        
        if (studio) {
          console.log(`✅ Found existing studio: ${studio.name}`);
          user.studio = studio._id;
          await user.save();
          console.log(`✅ Associated studio with user ${user.email}`);
        } else {
          console.log(`❌ No studio found for user ${user.email}`);
          console.log(`   Creating a new studio...`);
          
          const newStudio = await Studio.create({
            user: user._id,
            name: `${user.name}'s Studio`,
            description: 'Professional recording studio',
            location: {
              country: 'Sri Lanka',
              city: user.city || 'Colombo',
              address: '123 Music Street'
            },
            equipment: ['Microphones', 'Audio Interface', 'Studio Monitors'],
            services: [{
              name: 'Recording Session',
              price: 150,
              durationMins: 180,
              description: 'Professional recording session'
            }],
            isApproved: true,
            availability: {
              schedule: []
            }
          });

          user.studio = newStudio._id;
          await user.save();
          console.log(`✅ Created new studio: ${newStudio.name}`);
        }
      } else {
        console.log(`✅ User ${user.email} already has studio: ${user.studio}`);
      }
    }

    console.log('\n✅ All done!');
    console.log('\nYou can now login with:');
    studioUsers.forEach(user => {
      console.log(`  - ${user.email} / password123`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

fixUserStudio();
