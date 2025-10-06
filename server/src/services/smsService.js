const axios = require('axios');
const ApiError = require('../utils/ApiError');

class SMSService {
  constructor() {
    // You can use services like Twilio, AWS SNS, or local SMS providers
    this.provider = process.env.SMS_PROVIDER || 'twilio'; // 'twilio', 'aws', 'dialog' (for Sri Lanka)
    this.apiKey = process.env.SMS_API_KEY;
    this.apiSecret = process.env.SMS_API_SECRET;
    this.fromNumber = process.env.SMS_FROM_NUMBER || 'Ripple Studios';
    
    // Initialize based on provider
    this.initializeProvider();
  }

  initializeProvider() {
    switch (this.provider) {
      case 'twilio':
        this.twilioClient = require('twilio')(this.apiKey, this.apiSecret);
        break;
      case 'dialog':
        // Dialog Axiata SMS API for Sri Lanka
        this.dialogBaseUrl = 'https://digitalapi.dialog.lk/sms/send';
        break;
      case 'aws':
        // AWS SNS configuration would go here
        break;
      default:
        console.warn('No SMS provider configured');
    }
  }

  // Format phone number to international format
  formatPhoneNumber(phone, countryCode = '+94') {
    if (!phone) return null;
    
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // Handle Sri Lankan numbers
    if (countryCode === '+94') {
      if (cleaned.startsWith('94')) {
        return '+' + cleaned;
      } else if (cleaned.startsWith('0')) {
        return '+94' + cleaned.substring(1);
      } else if (cleaned.length === 9) {
        return '+94' + cleaned;
      }
    }
    
    // Default: assume it's already in correct format or add country code
    if (!cleaned.startsWith(countryCode.replace('+', ''))) {
      return countryCode + cleaned;
    }
    
    return '+' + cleaned;
  }

  // Send SMS via Twilio
  async sendViaTwilio(to, message) {
    try {
      const result = await this.twilioClient.messages.create({
        body: message,
        from: this.fromNumber,
        to: to
      });
      
      return {
        success: true,
        messageId: result.sid,
        status: result.status,
        provider: 'twilio'
      };
    } catch (error) {
      console.error('Twilio SMS error:', error);
      throw new ApiError('Failed to send SMS via Twilio', 500);
    }
  }

  // Send SMS via Dialog Axiata (Sri Lanka)
  async sendViaDialog(to, message) {
    try {
      const response = await axios.post(this.dialogBaseUrl, {
        msisdn: to.replace('+', ''),
        message: message,
        sender: this.fromNumber
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        messageId: response.data.messageId,
        status: response.data.status,
        provider: 'dialog'
      };
    } catch (error) {
      console.error('Dialog SMS error:', error);
      throw new ApiError('Failed to send SMS via Dialog', 500);
    }
  }

  // Send SMS via AWS SNS
  async sendViaAWS(to, message) {
    // AWS SNS implementation would go here
    throw new ApiError('AWS SMS not implemented yet', 501);
  }

  // Main send method
  async sendSMS(to, message, options = {}) {
    if (!this.apiKey) {
      console.warn('SMS service not configured - skipping SMS send');
      return { success: false, reason: 'SMS service not configured' };
    }

    const formattedPhone = this.formatPhoneNumber(to, options.countryCode);
    if (!formattedPhone) {
      throw new ApiError('Invalid phone number format', 400);
    }

    // Truncate message if too long (SMS limit is usually 160 characters)
    const truncatedMessage = message.length > 160 
      ? message.substring(0, 157) + '...' 
      : message;

    try {
      let result;
      
      switch (this.provider) {
        case 'twilio':
          result = await this.sendViaTwilio(formattedPhone, truncatedMessage);
          break;
        case 'dialog':
          result = await this.sendViaDialog(formattedPhone, truncatedMessage);
          break;
        case 'aws':
          result = await this.sendViaAWS(formattedPhone, truncatedMessage);
          break;
        default:
          throw new ApiError('SMS provider not configured', 500);
      }

      // Log successful SMS (you might want to store this in database)
      console.log(`SMS sent successfully to ${formattedPhone} via ${this.provider}`);
      
      return result;
    } catch (error) {
      console.error('SMS sending failed:', error);
      throw error;
    }
  }

  // Booking-related SMS templates
  async sendBookingConfirmation(booking) {
    const phone = booking.client?.phone || booking.user?.phone;
    if (!phone) return { success: false, reason: 'No phone number' };

    const message = `Hi ${booking.client?.name || 'there'}! Your studio booking is confirmed for ${new Date(booking.start).toLocaleDateString()} at ${booking.studio?.name}. Booking ID: ${booking._id.slice(-8)}`;
    
    return this.sendSMS(phone, message);
  }

  async sendBookingReminder(booking) {
    const phone = booking.client?.phone || booking.user?.phone;
    if (!phone) return { success: false, reason: 'No phone number' };

    const message = `Reminder: Your studio session at ${booking.studio?.name} starts in 1 hour. Address: ${booking.studio?.location?.address || 'Check booking details'}`;
    
    return this.sendSMS(phone, message);
  }

  async sendBookingCancellation(booking, reason) {
    const phone = booking.client?.phone || booking.user?.phone;
    if (!phone) return { success: false, reason: 'No phone number' };

    const message = `Your booking at ${booking.studio?.name} on ${new Date(booking.start).toLocaleDateString()} has been cancelled. ${reason ? `Reason: ${reason}` : ''} Contact us for assistance.`;
    
    return this.sendSMS(phone, message);
  }

  async sendPaymentConfirmation(booking, amount) {
    const phone = booking.client?.phone || booking.user?.phone;
    if (!phone) return { success: false, reason: 'No phone number' };

    const message = `Payment confirmed! LKR ${amount} received for your booking at ${booking.studio?.name}. Thank you for choosing Ripple Studios!`;
    
    return this.sendSMS(phone, message);
  }

  // Studio-related SMS notifications
  async sendNewBookingAlert(studio, booking) {
    const phone = studio.contactInfo?.phone;
    if (!phone) return { success: false, reason: 'No studio phone number' };

    const message = `New booking received! ${booking.client?.name} booked ${booking.service?.name} for ${new Date(booking.start).toLocaleDateString()}. Check your dashboard for details.`;
    
    return this.sendSMS(phone, message);
  }

  async sendTicketAlert(ticket, recipient) {
    const phone = recipient.phone;
    if (!phone) return { success: false, reason: 'No phone number' };

    const message = `Support ticket #${ticket.ticketId} created: ${ticket.title}. Priority: ${ticket.priority}. Check your dashboard for details.`;
    
    return this.sendSMS(phone, message);
  }

  // Bulk SMS for marketing/announcements
  async sendBulkSMS(recipients, message, options = {}) {
    const results = [];
    
    for (const recipient of recipients) {
      try {
        const result = await this.sendSMS(recipient.phone, message, options);
        results.push({
          recipient: recipient.phone,
          success: result.success,
          messageId: result.messageId
        });
        
        // Add delay between messages to avoid rate limiting
        if (options.delay) {
          await new Promise(resolve => setTimeout(resolve, options.delay));
        }
      } catch (error) {
        results.push({
          recipient: recipient.phone,
          success: false,
          error: error.message
        });
      }
    }
    
    return results;
  }

  // Verify SMS delivery status (if supported by provider)
  async getDeliveryStatus(messageId) {
    if (this.provider === 'twilio' && this.twilioClient) {
      try {
        const message = await this.twilioClient.messages(messageId).fetch();
        return {
          status: message.status,
          errorCode: message.errorCode,
          errorMessage: message.errorMessage
        };
      } catch (error) {
        console.error('Failed to get SMS delivery status:', error);
        return { status: 'unknown' };
      }
    }
    
    return { status: 'not_supported' };
  }
}

// Export singleton instance
const smsService = new SMSService();

module.exports = {
  smsService,
  SMSService
};
