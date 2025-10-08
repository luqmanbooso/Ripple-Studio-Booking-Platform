const mongoose = require('mongoose');
require('dotenv').config();

// Import models 
const Review = require('./src/models/Review');
const Studio = require('./src/models/Studio');
const User = require('./src/models/User');
const Booking = require('./src/models/Booking');

async function fixReviewTargetTypes() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find all reviews with lowercase targetType
    const reviewsToFix = await Review.find({ targetType: 'studio' });
    console.log(`📊 Found ${reviewsToFix.length} reviews with lowercase 'studio' targetType`);

    if (reviewsToFix.length > 0) {
      // Update all reviews to use capitalized 'Studio'
      const result = await Review.updateMany(
        { targetType: 'studio' },
        { $set: { targetType: 'Studio' } }
      );
      
      console.log(`✅ Updated ${result.modifiedCount} reviews to use 'Studio' targetType`);
      
      // Verify the fix
      const updatedReviews = await Review.find({ targetType: 'Studio' }).limit(2);
      console.log('📝 Sample updated reviews:');
      updatedReviews.forEach(review => {
        console.log(`- Review ${review._id}: targetType = "${review.targetType}"`);
      });
      
      // Test populate functionality
      console.log('\n🔍 Testing populate functionality after fix...');
      const populatedReview = await Review.findOne()
        .populate('author', 'name email')
        .populate('targetId', 'name')
        .populate('booking', 'start end')
        .lean();
      
      if (populatedReview) {
        console.log('✅ Populate test successful after fix!');
        console.log('Target details:', {
          targetType: populatedReview.targetType,
          targetId: populatedReview.targetId
        });
      } else {
        console.log('❌ No reviews found for populate test');
      }
    } else {
      console.log('✅ No reviews need to be updated');
    }

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

fixReviewTargetTypes();