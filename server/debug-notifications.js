const mongoose = require('mongoose');
require('dotenv').config();

const Notification = require('./src/models/Notification');
const User = require('./src/models/User');

async function debugNotifications() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔗 Connected to MongoDB');

    // Check total notifications count
    const notificationCount = await Notification.countDocuments();
    console.log(`📊 Total notifications in database: ${notificationCount}`);

    // Check users with notifications
    const usersWithNotifications = await Notification.aggregate([
      { $group: { _id: '$user', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    console.log('👥 Users with notifications:', usersWithNotifications);

    // Get sample notifications
    const sampleNotifications = await Notification.find()
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .limit(5);
    
    console.log('📋 Sample notifications:');
    sampleNotifications.forEach((notif, index) => {
      console.log(`${index + 1}. ${notif.title} - ${notif.message}`);
      console.log(`   User: ${notif.user?.name} (${notif.user?.role})`);
      console.log(`   Type: ${notif.type}, Read: ${notif.isRead}`);
      console.log(`   Created: ${notif.createdAt}`);
      console.log('   ---');
    });

    // Check notification stats for a specific user
    const testUser = await User.findOne({ role: 'admin' });
    if (testUser) {
      console.log(`🔍 Checking notifications for admin user: ${testUser.name}`);
      
      const userNotifications = await Notification.find({ user: testUser._id })
        .sort({ createdAt: -1 })
        .limit(5);
      
      console.log(`📨 User has ${userNotifications.length} notifications:`);
      userNotifications.forEach((notif, index) => {
        console.log(`${index + 1}. ${notif.title} - ${notif.type} (Read: ${notif.isRead})`);
      });

      const unreadCount = await Notification.countDocuments({ 
        user: testUser._id, 
        isRead: false 
      });
      console.log(`📬 Unread notifications for this user: ${unreadCount}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

debugNotifications();