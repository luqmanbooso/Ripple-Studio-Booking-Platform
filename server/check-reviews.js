const mongoose = require('mongoose');
require('dotenv').config();

// Import models to ensure they're registered
const Review = require('./src/models/Review');
const Studio = require('./src/models/Studio');
const Artist = require('./src/models/Artist');
const User = require('./src/models/User');
const Booking = require('./src/models/Booking');

async function checkReviews() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check if reviews exist
    const reviewCount = await Review.countDocuments();
    console.log(`📊 Total reviews in database: ${reviewCount}`);

    if (reviewCount > 0) {
      // Get a sample of reviews
      const sampleReviews = await Review.find().limit(5).lean();
      console.log('📝 Sample reviews:');
      console.log(JSON.stringify(sampleReviews, null, 2));

      // Try to populate a review to test if it works
      console.log('\n🔍 Testing populate functionality...');
      const populatedReview = await Review.findOne()
        .populate('author', 'name email')
        .populate('targetId', 'name')
        .populate('booking', 'start end')
        .lean();
      
      if (populatedReview) {
        console.log('✅ Populate test successful:');
        console.log(JSON.stringify(populatedReview, null, 2));
      } else {
        console.log('❌ No reviews found for populate test');
      }
    }

    // Check Studio model registration
    console.log('\n🏢 Testing Studio model...');
    const studioCount = await Studio.countDocuments();
    console.log(`Studios in database: ${studioCount}`);

    // List all registered models
    console.log('\n📋 Registered Mongoose models:');
    console.log(Object.keys(mongoose.models));

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  }
}

checkReviews();