const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Generate verification token
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Send client verification email
const sendClientVerificationEmail = async (user, verificationToken) => {
  const transporter = createTransporter();
  
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}&email=${user.email}`;
  
  const mailOptions = {
    from: `"Ripple Studio" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to: user.email,
    subject: 'Verify Your Ripple Studio Account',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Account</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Ripple Studio!</h1>
          </div>
          <div class="content">
            <h2>Hi ${user.name},</h2>
            <p>Thank you for joining Ripple Studio! To start booking amazing studios and connecting with talented musicians, please verify your email address.</p>
            
            <p>Click the button below to verify your account:</p>
            <a href="${verificationUrl}" class="button">Verify My Account</a>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
            
            <p><strong>What happens after verification?</strong></p>
            <ul>
              <li>Access to book studios</li>
              <li>Connect with musicians</li>
              <li>Leave reviews and ratings</li>
              <li>Manage your bookings</li>
            </ul>
            
            <p>This verification link will expire in 24 hours for security reasons.</p>
            
            <p>If you didn't create this account, please ignore this email.</p>
            
            <p>Best regards,<br>The Ripple Studio Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Ripple Studio. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  await transporter.sendMail(mailOptions);
};

// Send studio approval notification email
const sendStudioApprovalEmail = async (user, studio) => {
  const transporter = createTransporter();
  
  const dashboardUrl = `${process.env.CLIENT_URL}/dashboard`;
  
  const mailOptions = {
    from: `"Ripple Studio" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to: user.email,
    subject: 'Your Studio Has Been Approved! 🎉',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Studio Approved</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .highlight { background: #e6fffa; padding: 15px; border-left: 4px solid #10b981; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Congratulations!</h1>
            <h2>Your Studio is Now Live!</h2>
          </div>
          <div class="content">
            <h2>Hi ${user.name},</h2>
            <p>Great news! Your studio "<strong>${studio.name}</strong>" has been approved and is now live on Ripple Studio!</p>
            
            <div class="highlight">
              <h3>🚀 What's Next?</h3>
              <ul>
                <li><strong>Start receiving bookings</strong> from clients</li>
                <li><strong>Manage your availability</strong> and services</li>
                <li><strong>Build your reputation</strong> with reviews</li>
                <li><strong>Grow your business</strong> with our platform</li>
              </ul>
            </div>
            
            <p>Your studio is now visible to thousands of potential clients looking for professional recording spaces.</p>
            
            <a href="${dashboardUrl}" class="button">Go to Your Dashboard</a>
            
            <p><strong>Quick Setup Tips:</strong></p>
            <ul>
              <li>Add your services and pricing</li>
              <li>Upload high-quality photos of your studio</li>
              <li>Set your availability schedule</li>
              <li>Complete your profile with equipment details</li>
            </ul>
            
            <p>If you have any questions or need help getting started, don't hesitate to reach out to our support team.</p>
            
            <p>Welcome to the Ripple Studio family!</p>
            
            <p>Best regards,<br>The Ripple Studio Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Ripple Studio. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  await transporter.sendMail(mailOptions);
};

// Send studio rejection email
const sendStudioRejectionEmail = async (user, studio, reason) => {
  const transporter = createTransporter();
  
  const supportUrl = `${process.env.CLIENT_URL}/contact`;
  
  const mailOptions = {
    from: `"Ripple Studio" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to: user.email,
    subject: 'Studio Application Update',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Studio Application Update</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .reason-box { background: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Studio Application Update</h1>
          </div>
          <div class="content">
            <h2>Hi ${user.name},</h2>
            <p>Thank you for your interest in joining Ripple Studio as a studio partner.</p>
            
            <p>After reviewing your application for "<strong>${studio.name}</strong>", we need to request some additional information or improvements before we can approve your studio.</p>
            
            ${reason ? `
            <div class="reason-box">
              <h3>📋 Feedback:</h3>
              <p>${reason}</p>
            </div>
            ` : ''}
            
            <p><strong>Next Steps:</strong></p>
            <ul>
              <li>Review the feedback above</li>
              <li>Update your studio information</li>
              <li>Resubmit your application</li>
            </ul>
            
            <p>We want to ensure all studios on our platform meet our quality standards to provide the best experience for our clients.</p>
            
            <a href="${supportUrl}" class="button">Contact Support</a>
            
            <p>If you have any questions about this feedback or need assistance, please don't hesitate to contact our support team.</p>
            
            <p>Thank you for your understanding.</p>
            
            <p>Best regards,<br>The Ripple Studio Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Ripple Studio. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  await transporter.sendMail(mailOptions);
};

// Send admin notification for new studio registration
const sendAdminStudioNotification = async (user, studio) => {
  const transporter = createTransporter();
  
  const adminUrl = `${process.env.CLIENT_URL}/admin/studios`;
  
  const mailOptions = {
    from: `"Ripple Studio" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: 'New Studio Registration - Approval Required',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Studio Registration</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .info-box { background: white; padding: 15px; border: 1px solid #e5e7eb; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏢 New Studio Registration</h1>
          </div>
          <div class="content">
            <h2>New Studio Awaiting Approval</h2>
            
            <div class="info-box">
              <h3>Studio Details:</h3>
              <p><strong>Studio Name:</strong> ${studio.name}</p>
              <p><strong>Owner:</strong> ${user.name}</p>
              <p><strong>Email:</strong> ${user.email}</p>
              <p><strong>Location:</strong> ${studio.location.city}, ${studio.location.country}</p>
              <p><strong>Registration Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            
            <p>A new studio has registered and is awaiting admin approval. Please review the studio details and approve or reject the application.</p>
            
            <a href="${adminUrl}" class="button">Review in Admin Panel</a>
            
            <p>The studio owner will be notified via email once you make a decision.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  generateVerificationToken,
  sendClientVerificationEmail,
  sendStudioApprovalEmail,
  sendStudioRejectionEmail,
  sendAdminStudioNotification
};
