# 🔐 Verification & Approval System

This document outlines the complete verification and approval workflow implemented in the Ripple Studio platform.

## 📋 Overview

The system implements a two-tier verification process:

1. **Client Email Verification** - Clients must verify their email before booking studios
2. **Studio Admin Approval** - Studios require admin approval before accepting bookings

## 🔄 Client Verification Flow

### Registration Process
1. **User Registration**: Client registers with email/password
2. **Verification Token**: System generates a unique verification token
3. **Email Sent**: Verification email sent to client's email address
4. **Account Status**: Client can login but cannot make bookings until verified

### Verification Process
1. **Email Link**: Client clicks verification link in email
2. **Token Validation**: System validates token and expiry (24 hours)
3. **Account Activation**: User's `verified` status set to `true`
4. **Booking Access**: Client can now make bookings

### Features
- ✅ **Automatic Email Sending** during registration
- ✅ **24-hour Token Expiry** for security
- ✅ **Resend Verification** functionality
- ✅ **Booking Restrictions** for unverified users
- ✅ **Dashboard Banners** showing verification status

## 🏢 Studio Approval Flow

### Registration Process
1. **Studio Registration**: Studio owner registers and creates studio profile
2. **Pending Status**: Studio marked as `isApproved: false`
3. **Admin Notification**: Email sent to admin about new studio registration
4. **Account Access**: Studio owner can login and manage profile but cannot receive bookings

### Approval Process
1. **Admin Review**: Admin reviews studio details in admin panel
2. **Decision Making**: Admin can approve or reject with reason
3. **Email Notification**: Studio owner receives approval/rejection email
4. **Booking Access**: Approved studios can receive bookings

### Features
- ✅ **Admin Dashboard** for studio management
- ✅ **Detailed Studio Review** interface
- ✅ **Approval/Rejection** with email notifications
- ✅ **Pending Studios Queue** for admins
- ✅ **Studio Status Banners** on dashboard

## 📧 Email Templates

### Client Verification Email
- **Subject**: "Verify Your Ripple Studio Account"
- **Content**: Welcome message with verification link
- **CTA**: "Verify My Account" button
- **Expiry**: 24-hour warning

### Studio Approval Email
- **Subject**: "Your Studio Has Been Approved! 🎉"
- **Content**: Congratulations with next steps
- **CTA**: "Go to Your Dashboard" button
- **Tips**: Setup recommendations

### Studio Rejection Email
- **Subject**: "Studio Application Update"
- **Content**: Feedback and improvement suggestions
- **Reason**: Admin-provided rejection reason
- **CTA**: "Contact Support" button

### Admin Notification Email
- **Subject**: "New Studio Registration - Approval Required"
- **Content**: Studio details summary
- **CTA**: "Review in Admin Panel" button

## 🛡️ Security Features

### Token Security
- **Crypto-random tokens** (32 bytes)
- **Time-based expiry** (24 hours)
- **Single-use tokens** (deleted after verification)
- **Email validation** required

### Access Control
- **Booking restrictions** for unverified clients
- **Studio visibility** only for approved studios
- **Admin-only approval** interface
- **Role-based permissions**

## 🎯 API Endpoints

### Authentication Routes
```
GET  /api/auth/verify-email?token=xxx&email=xxx
POST /api/auth/resend-verification
```

### Admin Routes
```
GET    /api/admin/studios/pending
PATCH  /api/admin/studios/:id/approve
PATCH  /api/admin/studios/:id/reject
```

### Booking Validation
```
POST /api/bookings (includes verification checks)
```

## 🎨 Frontend Components

### Client Components
- **VerificationBanner**: Shows on client dashboard for unverified users
- **VerifyEmail**: Email verification page with status handling
- **ResendVerification**: Functionality in banners and modals

### Studio Components
- **StudioApprovalBanner**: Shows pending approval status
- **StudioProfileManager**: Complete profile setup interface

### Admin Components
- **AdminStudioApprovals**: Review and approve/reject studios
- **PendingStudiosQueue**: List of studios awaiting approval

## 📱 User Experience

### Client Journey
1. **Register** → Receive verification email
2. **Login** → See verification banner on dashboard
3. **Verify Email** → Click link or resend if needed
4. **Book Studios** → Full access to platform

### Studio Journey
1. **Register** → Create studio profile
2. **Login** → See approval pending banner
3. **Complete Profile** → Add details while waiting
4. **Get Approved** → Receive email notification
5. **Accept Bookings** → Full studio functionality

### Admin Journey
1. **Receive Notification** → New studio registration email
2. **Review Application** → Check studio details
3. **Make Decision** → Approve or reject with reason
4. **Send Notification** → Automatic email to studio owner

## ⚙️ Configuration

### Environment Variables
```bash
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@ripplestudio.lk

# Admin Configuration
ADMIN_EMAIL=admin@ripplestudio.lk

# Client URL for email links
CLIENT_URL=http://localhost:5173
```

### Email Service Setup
1. **Gmail Setup**: Enable 2FA and generate app password
2. **SMTP Configuration**: Configure host, port, and credentials
3. **Template Customization**: Modify email templates as needed

## 🚀 Deployment Considerations

### Production Setup
- **HTTPS Required**: For secure email links
- **Email Delivery**: Use reliable SMTP service (SendGrid, Mailgun)
- **Domain Configuration**: Set proper FROM addresses
- **Rate Limiting**: Implement email sending limits

### Monitoring
- **Email Delivery**: Track bounce rates and failures
- **Verification Rates**: Monitor client verification completion
- **Approval Times**: Track admin response times
- **Error Handling**: Log and alert on failures

## 🔧 Troubleshooting

### Common Issues
1. **Emails not sending**: Check SMTP configuration
2. **Verification links broken**: Verify CLIENT_URL setting
3. **Tokens expired**: Check 24-hour expiry window
4. **Admin notifications missing**: Verify ADMIN_EMAIL setting

### Debug Commands
```bash
# Test email configuration
npm run test:email

# Check verification status
npm run check:verification

# Resend admin notifications
npm run resend:admin-notifications
```

## 📈 Analytics & Metrics

### Key Metrics to Track
- **Verification Rate**: % of clients who verify email
- **Approval Rate**: % of studios approved
- **Time to Verify**: Average time for email verification
- **Time to Approve**: Average admin approval time
- **Email Delivery Rate**: % of emails successfully delivered

### Monitoring Dashboard
- **Pending Verifications**: Real-time count
- **Pending Approvals**: Admin queue status
- **Email Status**: Delivery and bounce rates
- **User Conversion**: Registration to active user rate

---

## 🎉 System Benefits

✅ **Enhanced Security**: Email verification prevents fake accounts  
✅ **Quality Control**: Admin approval ensures studio standards  
✅ **User Trust**: Verified users and approved studios build confidence  
✅ **Spam Prevention**: Reduces fraudulent registrations  
✅ **Professional Image**: Proper onboarding process  
✅ **Compliance**: Email verification for legal requirements  

The verification and approval system ensures a high-quality, secure platform for both clients and studios while maintaining professional standards and user trust.
