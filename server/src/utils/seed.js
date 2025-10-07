const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Studio = require('../models/Studio');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const logger = require('./logger');

require('dotenv').config();

const seedData = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding');

    // Clear existing data
    await User.deleteMany({});
    await Studio.deleteMany({});
    await Booking.deleteMany({});
    await Review.deleteMany({});
    await Notification.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@musicbooking.com',
      password: 'admin123',
      role: 'admin',
      verified: true,
      isActive: true
    });

    // Artists removed - now studio-only platform

    // Create sample studios with different approval statuses
    const studioUsers = [];
    const studios = [];

    for (let i = 1; i <= 5; i++) {
      const user = await User.create({
        name: `Studio Owner ${i}`,
        email: `studio${i}@example.com`,
        password: 'password123',
        role: 'studio',
        verified: true,
        country: 'Sri Lanka',
        city: ['Colombo', 'Kandy', 'Galle', 'Negombo', 'Jaffna'][i-1]
      });

      const studioNames = [
        'Premium Recording Studio',
        'Ocean View Studios', 
        'Downtown Music Hub',
        'Harmony Sound Studios',
        'Rhythm & Blues Studio'
      ];

      const studio = await Studio.create({
        user: user._id,
        name: studioNames[i-1],
        description: `Professional recording studio with state-of-the-art equipment and experienced engineers.`,
        location: {
          country: 'Sri Lanka',
          city: ['Colombo', 'Kandy', 'Galle', 'Negombo', 'Jaffna'][i-1],
          address: [`123 Music Ave`, `456 Studio Blvd`, `789 Sound St`, `321 Beat Lane`, `654 Melody Road`][i-1]
        },
        equipment: [
          ['Pro Tools HD', 'Neumann U87', 'SSL Console'],
          ['Logic Pro X', 'Vintage Neve', 'Telefunken ELA M 251'],
          ['Ableton Live', 'API Console', 'AKG C414'],
          ['Cubase Pro', 'Focusrite Interface', 'Shure SM7B'],
          ['Studio One', 'Universal Audio', 'Audio-Technica AT4040']
        ][i-1],
        services: [{
          name: 'Recording Session',
          price: [150, 200, 125, 180, 160][i-1],
          durationMins: 180,
          description: 'Full recording session with engineer'
        }, {
          name: 'Mixing',
          price: [100, 150, 75, 120, 110][i-1],
          durationMins: 120,
          description: 'Professional mixing service'
        }],
        ratingAvg: [4.6, 4.9, 4.4, 4.7, 4.5][i-1] || 0,
        ratingCount: [28, 45, 16, 32, 19][i-1] || 0,
        // Different approval statuses for demonstration
        isApproved: i <= 3, // First 3 approved, last 2 pending
        statusReason: i <= 3 ? 'Approved by admin' : 'Pending review',
        availability: [{
          start: new Date('2025-01-01T09:00:00Z'),
          end: new Date('2025-12-31T22:00:00Z'),
          isRecurring: true,
          daysOfWeek: [0, 1, 2, 3, 4, 5, 6] // All days
        }]
      });

      user.studio = studio._id;
      await user.save();

      studioUsers.push(user);
      studios.push(studio);
    }

    // Create sample clients with different verification statuses
    const clients = [];
    for (let i = 1; i <= 5; i++) {
      const client = await User.create({
        name: `Client ${i}`,
        email: `client${i}@example.com`,
        password: 'password123',
        role: 'client',
        // Different verification statuses for demonstration
        verified: i <= 3, // First 3 verified, last 2 unverified
        country: 'Sri Lanka',
        city: ['Colombo', 'Kandy', 'Galle', 'Negombo', 'Jaffna'][i-1],
        // Add verification tokens for unverified users
        ...(i > 3 && {
          emailVerificationToken: `verification_token_${i}`,
          emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
        })
      });
      clients.push(client);
    }

    console.log('Created sample users');

    // Create sample bookings
    const now = new Date();
    const bookings = [];

    // Past completed booking
    const pastBooking = await Booking.create({
      client: clients[0]._id,
      studio: studios[0]._id,
      service: {
        name: 'Recording Session',
        price: 150,
        durationMins: 180
      },
      start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      end: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // 3 hours duration
      status: 'completed',
      price: 150,
      completedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000)
    });

    // Upcoming confirmed booking
    const upcomingBooking = await Booking.create({
      client: clients[1]._id,
      studio: studios[0]._id,
      service: {
        name: 'Recording Session',
        price: 200,
        durationMins: 180
      },
      start: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      end: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
      status: 'confirmed',
      price: 200,
      paymentIntentId: 'pi_test_' + Math.random().toString(36).substr(2, 9)
    });

    bookings.push(pastBooking, upcomingBooking);

    console.log('Created sample bookings');

    // Create sample reviews
    await Review.create({
      author: clients[0]._id,
      targetType: 'studio',
      targetId: studios[0]._id,
      booking: pastBooking._id,
      rating: 5,
      comment: 'Amazing session! Very professional studio with great equipment.',
      isApproved: true
    });

    await Review.create({
      author: clients[1]._id,
      targetType: 'studio',
      targetId: studios[0]._id,
      booking: upcomingBooking._id,
      rating: 5,
      comment: 'Great studio with excellent equipment and sound.',
      isApproved: true
    });

    console.log('Created sample reviews');

    // Create sample notifications for admin
    const sampleNotifications = [
      {
        user: adminUser._id,
        type: 'studio_registration',
        title: 'New Studio Registration',
        message: `${studios[3].name} has registered and is awaiting approval`,
        data: {
          studioId: studios[3]._id,
          userId: studioUsers[3]._id,
          actionRequired: true,
          url: '/admin/studios/approvals',
          metadata: {
            studioName: studios[3].name,
            ownerName: studioUsers[3].name,
            ownerEmail: studioUsers[3].email
          }
        },
        priority: 'high'
      },
      {
        user: adminUser._id,
        type: 'user_registration',
        title: 'New User Registration',
        message: `${clients[4].name} (client) has joined the platform`,
        data: {
          userId: clients[4]._id,
          url: '/admin/users',
          metadata: {
            userName: clients[4].name,
            userEmail: clients[4].email,
            userRole: clients[4].role
          }
        },
        priority: 'low'
      },
      {
        user: adminUser._id,
        type: 'booking_created',
        title: 'New Booking Created',
        message: `${clients[0].name} booked ${studios[0].name} for Recording Session`,
        data: {
          bookingId: bookings[0]._id,
          userId: clients[0]._id,
          studioId: studios[0]._id,
          amount: bookings[0].price,
          currency: 'LKR',
          url: '/admin/bookings'
        },
        priority: 'medium'
      },
      {
        user: adminUser._id,
        type: 'revenue_milestone',
        title: 'Revenue Milestone Achieved! 🎉',
        message: 'Platform has reached LKR 50,000 in total revenue!',
        data: {
          amount: 50000,
          currency: 'LKR',
          url: '/admin/revenue',
          metadata: {
            milestone: 50000,
            achievedDate: new Date()
          }
        },
        priority: 'medium'
      },
      {
        user: adminUser._id,
        type: 'system_alert',
        title: 'System Alert: High Server Load',
        message: 'Server CPU usage has exceeded 80% for the past 10 minutes',
        data: {
          actionRequired: true,
          url: '/admin',
          metadata: {
            alertType: 'High Server Load',
            cpuUsage: '85%',
            alertTime: new Date()
          }
        },
        priority: 'high',
        isRead: false
      }
    ];

    await Notification.insertMany(sampleNotifications);
    console.log('Created sample notifications');

    console.log('✅ Database seeded successfully!');
    console.log('\n🔐 VERIFICATION & APPROVAL SYSTEM DEMO DATA:');
    console.log('\n👤 Sample accounts created:');
    console.log('Admin: admin@musicbooking.com / admin123');
    console.log('\n🏢 Studios (with approval status):');
    console.log('✅ Approved: studio1@example.com / password123 (Premium Recording Studio)');
    console.log('✅ Approved: studio2@example.com / password123 (Ocean View Studios)');
    console.log('✅ Approved: studio3@example.com / password123 (Downtown Music Hub)');
    console.log('⏳ Pending: studio4@example.com / password123 (Harmony Sound Studios)');
    console.log('⏳ Pending: studio5@example.com / password123 (Rhythm & Blues Studio)');
    console.log('\n👥 Clients (with verification status):');
    console.log('✅ Verified: client1@example.com / password123');
    console.log('✅ Verified: client2@example.com / password123');
    console.log('✅ Verified: client3@example.com / password123');
    console.log('❌ Unverified: client4@example.com / password123');
    console.log('❌ Unverified: client5@example.com / password123');
    console.log('\n📧 Email System:');
    console.log('- Unverified clients will see verification banners');
    console.log('- Pending studios will see approval banners');
    console.log('- Admin can approve/reject studios at /admin/studios/approvals');
    console.log('- Email notifications configured (check .env for SMTP settings)');
    console.log('\n🔔 Notification System:');
    console.log('- Admin notifications created for demo');
    console.log('- Real-time notification bell in admin navbar');
    console.log('- Comprehensive notification center at /admin/notifications');
    console.log('- Notifications for: registrations, bookings, alerts, milestones');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run if called directly
if (require.main === module) {
  seedData();
}

module.exports = seedData;
