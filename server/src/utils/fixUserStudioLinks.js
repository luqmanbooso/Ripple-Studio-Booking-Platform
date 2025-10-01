const mongoose = require('mongoose');
const User = require('../models/User');
const Studio = require('../models/Studio');
require('dotenv').config();

const fixUserStudioLinks = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all studio users
    const studioUsers = await User.find({ role: 'studio' });
    console.log(`Found ${studioUsers.length} studio users`);

    let fixed = 0;
    let alreadyLinked = 0;

    for (const user of studioUsers) {
      // Check if user already has studio field
      if (user.studio) {
        console.log(`✓ User ${user.email} already has studio: ${user.studio}`);
        alreadyLinked++;
        continue;
      }

      // Find studio owned by this user
      const studio = await Studio.findOne({ user: user._id });
      
      if (studio) {
        user.studio = studio._id;
        await user.save();
        console.log(`✅ Fixed: ${user.email} → Studio: ${studio.name} (${studio._id})`);
        fixed++;
      } else {
        console.log(`⚠️  Warning: No studio found for ${user.email}`);
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   - Already linked: ${alreadyLinked}`);
    console.log(`   - Fixed: ${fixed}`);
    console.log(`   - Missing studios: ${studioUsers.length - alreadyLinked - fixed}`);

    await mongoose.disconnect();
    console.log('\n✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

fixUserStudioLinks();
