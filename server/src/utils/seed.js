const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Studio = require('../models/Studio');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
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

    // Create sample studios
    const studioUsers = [];
    const studios = [];

    for (let i = 1; i <= 3; i++) {
      const user = await User.create({
        name: `Studio Owner ${i}`,
        email: `studio${i}@example.com`,
        password: 'password123',
        role: 'studio',
        verified: true,
        country: 'Sri Lanka',
        city: ['Colombo', 'Kandy', 'Galle'][i-1]
      });

      const studio = await Studio.create({
        user: user._id,
        name: [`Premium Recording Studio`, `Ocean View Studios`, `Downtown Music Hub`][i-1],
        description: `Professional recording studio with state-of-the-art equipment and experienced engineers.`,
        location: {
          country: 'Sri Lanka',
          city: ['Colombo', 'Kandy', 'Galle'][i-1],
          address: [`123 Music Ave`, `456 Studio Blvd`, `789 Sound St`][i-1]
        },
        equipment: [
          ['Pro Tools HD', 'Neumann U87', 'SSL Console'],
          ['Logic Pro X', 'Vintage Neve', 'Telefunken ELA M 251'],
          ['Ableton Live', 'API Console', 'AKG C414']
        ][i-1],
        services: [{
          name: 'Recording Session',
          price: [150, 200, 125][i-1],
          durationMins: 180,
          description: 'Full recording session with engineer'
        }, {
          name: 'Mixing',
          price: [100, 150, 75][i-1],
          durationMins: 120,
          description: 'Professional mixing service'
        }],
        ratingAvg: [4.6, 4.9, 4.4][i-1],
        ratingCount: [28, 45, 16][i-1],
        availability: [{
          start: new Date('2024-01-01T09:00:00Z'),
          end: new Date('2024-12-31T22:00:00Z'),
          isRecurring: true,
          daysOfWeek: [0, 1, 2, 3, 4, 5, 6] // All days
        }]
      });

      user.studio = studio._id;
      await user.save();

      studioUsers.push(user);
      studios.push(studio);
    }

    // Create sample clients
    const clients = [];
    for (let i = 1; i <= 3; i++) {
      const client = await User.create({
        name: `Client ${i}`,
        email: `client${i}@example.com`,
        password: 'password123',
        role: 'client',
        verified: true,
        country: 'Sri Lanka',
        city: ['Colombo', 'Kandy', 'Galle'][i-1]
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

    console.log('✅ Database seeded successfully!');
    console.log('\nSample accounts created:');
    console.log('Admin: admin@musicbooking.com / admin123');
    console.log('Studio: studio1@example.com / password123');
    console.log('Client: client1@example.com / password123');

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
