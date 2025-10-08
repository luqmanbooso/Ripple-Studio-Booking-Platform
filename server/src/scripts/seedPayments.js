const mongoose = require('mongoose');
const Payment = require('../models/Payment');
const User = require('../models/User');
const path = require('path');

// Load environment variables from the correct path
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

/**
 * Seed sample payment data for testing
 * This script creates realistic payment records for development/testing
 */

const samplePayments = [
  {
    payhereOrderId: 'booking_67890_1728398400000',
    payherePaymentId: 'pay_1728398400_001',
    status: 'Completed',
    amount: 5000,
    currency: 'LKR',
    completedAt: new Date('2024-10-01T10:30:00Z'),
    initiatedAt: new Date('2024-10-01T10:25:00Z'),
    service: {
      name: 'Recording Session',
      price: 5000,
      durationMins: 60,
      description: 'Professional recording session with mixing'
    },
    studio: {
      name: 'Harmony Studios',
      email: 'contact@harmonystudios.lk'
    },
    notes: 'Great session, excellent sound quality'
  },
  {
    payhereOrderId: 'booking_67891_1728484800000',
    payherePaymentId: 'pay_1728484800_002',
    status: 'Completed',
    amount: 7500,
    currency: 'LKR',
    completedAt: new Date('2024-10-02T14:15:00Z'),
    initiatedAt: new Date('2024-10-02T14:10:00Z'),
    service: {
      name: 'Mixing & Mastering',
      price: 7500,
      durationMins: 90,
      description: 'Professional mixing and mastering service'
    },
    studio: {
      name: 'Sound Wave Studios',
      email: 'info@soundwave.lk'
    },
    notes: 'Mixing session for album track'
  },
  {
    payhereOrderId: 'booking_67892_1728571200000',
    payherePaymentId: 'pay_1728571200_003',
    status: 'Completed',
    amount: 3500,
    currency: 'LKR',
    completedAt: new Date('2024-10-03T16:45:00Z'),
    initiatedAt: new Date('2024-10-03T16:40:00Z'),
    service: {
      name: 'Rehearsal Room',
      price: 3500,
      durationMins: 120,
      description: 'Band rehearsal with full equipment'
    },
    studio: {
      name: 'Rock City Studios',
      email: 'booking@rockcity.lk'
    },
    notes: 'Band practice session'
  },
  {
    payhereOrderId: 'booking_67893_1728657600000',
    payherePaymentId: 'pay_1728657600_004',
    status: 'Completed',
    amount: 12000,
    currency: 'LKR',
    completedAt: new Date('2024-10-04T11:20:00Z'),
    initiatedAt: new Date('2024-10-04T11:15:00Z'),
    service: {
      name: 'Full Production Package',
      price: 12000,
      durationMins: 240,
      description: 'Complete recording, mixing, and mastering package'
    },
    studio: {
      name: 'Elite Audio Productions',
      email: 'studio@eliteaudio.lk'
    },
    notes: 'Full album production session'
  },
  {
    payhereOrderId: 'booking_67894_1728744000000',
    payherePaymentId: 'pay_1728744000_005',
    status: 'Pending',
    amount: 4500,
    currency: 'LKR',
    initiatedAt: new Date('2024-10-05T09:30:00Z'),
    service: {
      name: 'Vocal Recording',
      price: 4500,
      durationMins: 90,
      description: 'Professional vocal recording session'
    },
    studio: {
      name: 'Vocal Booth Studios',
      email: 'vocals@vocalbooths.lk'
    },
    notes: 'Vocal overdubs for single'
  },
  {
    payhereOrderId: 'booking_67895_1728830400000',
    payherePaymentId: 'pay_1728830400_006',
    status: 'Failed',
    amount: 6000,
    currency: 'LKR',
    initiatedAt: new Date('2024-10-06T13:45:00Z'),
    failedAt: new Date('2024-10-06T13:47:00Z'),
    failureReason: 'Payment declined by bank',
    service: {
      name: 'Live Recording',
      price: 6000,
      durationMins: 180,
      description: 'Live performance recording'
    },
    studio: {
      name: 'Live Sound Studios',
      email: 'live@livesound.lk'
    },
    notes: 'Live session recording attempt'
  }
];

async function seedPayments() {
  try {
    // Debug environment variables
    console.log('🔍 Checking environment variables...');
    console.log('MONGO_URI exists:', !!process.env.MONGO_URI);
    console.log('NODE_ENV:', process.env.NODE_ENV);
    
    if (!process.env.MONGO_URI) {
      console.log('❌ MONGO_URI not found in environment variables');
      console.log('Available env vars:', Object.keys(process.env).filter(key => key.includes('MONGO')));
      process.exit(1);
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find a user to associate payments with (preferably a client)
    const user = await User.findOne({ role: 'client' });
    if (!user) {
      console.log('❌ No client user found. Please create a client user first.');
      process.exit(1);
    }

    console.log(`📝 Creating payments for user: ${user.name} (${user.email})`);

    // Clear existing test payments
    await Payment.deleteMany({ 
      payhereOrderId: { $regex: /^booking_678/ } 
    });
    console.log('🗑️ Cleared existing test payments');

    // Create sample payments
    const createdPayments = [];
    
    for (const paymentData of samplePayments) {
      const payment = await Payment.create({
        booking: new mongoose.Types.ObjectId(), // Dummy booking ID
        payhereOrderId: paymentData.payhereOrderId,
        payherePaymentId: paymentData.payherePaymentId,
        status: paymentData.status,
        amount: paymentData.amount,
        currency: paymentData.currency,
        completedAt: paymentData.completedAt,
        initiatedAt: paymentData.initiatedAt,
        failedAt: paymentData.failedAt,
        failureReason: paymentData.failureReason,
        bookingSnapshot: {
          client: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone || '+94771234567'
          },
          studio: {
            id: new mongoose.Types.ObjectId(),
            name: paymentData.studio.name,
            email: paymentData.studio.email
          },
          service: paymentData.service,
          start: paymentData.completedAt || paymentData.initiatedAt,
          end: new Date((paymentData.completedAt || paymentData.initiatedAt).getTime() + (paymentData.service.durationMins * 60 * 1000)),
          notes: paymentData.notes
        }
      });
      
      createdPayments.push(payment);
      console.log(`✅ Created payment: ${payment.payhereOrderId} - ${payment.status} - LKR ${payment.amount}`);
    }

    console.log(`\n🎉 Successfully created ${createdPayments.length} sample payments!`);
    
    // Display summary
    const totalCompleted = createdPayments.filter(p => p.status === 'Completed').length;
    const totalAmount = createdPayments
      .filter(p => p.status === 'Completed')
      .reduce((sum, p) => sum + p.amount, 0);
    
    console.log(`\n📊 Summary:`);
    console.log(`   • Total Payments: ${createdPayments.length}`);
    console.log(`   • Completed: ${totalCompleted}`);
    console.log(`   • Total Amount: LKR ${totalAmount.toLocaleString()}`);
    console.log(`   • User: ${user.name} (${user.email})`);
    
    console.log(`\n🚀 You can now view the spending history in the frontend!`);
    
  } catch (error) {
    console.error('❌ Error seeding payments:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📤 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the seeding script
if (require.main === module) {
  seedPayments();
}

module.exports = { seedPayments, samplePayments };
