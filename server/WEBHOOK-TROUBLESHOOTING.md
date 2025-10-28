# PayHere Webhook Troubleshooting Guide

This guide helps diagnose and fix PayHere webhook issues for the Ripple Studio Booking Platform.

## 🔍 Quick Diagnosis

Run the diagnostic tool:

```bash
cd server
node diagnose-webhook.js
```

This will check:

- ✅ Environment variables
- ✅ Webhook URLs
- ✅ Database configuration
- ✅ PayHere settings
- ⚠️ Localhost/ngrok warnings

---

## 🚨 Common Issues & Solutions

### Issue 1: Webhook Not Receiving Requests

**Symptoms:**

- Booking status stays "pending" after payment
- Wallet balance doesn't update
- No logs showing "PayHere webhook received"

**Causes & Solutions:**

#### A) Using localhost (Most Common)

PayHere **cannot** send webhooks to `http://localhost:5000`

**Solution: Use ngrok**

```bash
# Install ngrok globally
npm install -g ngrok

# Start ngrok tunnel (keep this running)
ngrok http 5000
```

You'll see output like:

```
Forwarding  https://abc123.ngrok.io -> http://localhost:5000
```

**Update your .env file:**

```env
SERVER_URL=https://abc123.ngrok.io
```

**Update PayHere Dashboard:**

1. Login to PayHere Merchant Dashboard
2. Go to Settings > Domains & Credentials > API Configuration
3. Set Notify URL: `https://abc123.ngrok.io/api/webhooks/payhere`
4. Save changes

**Restart your server:**

```bash
npm run dev
```

#### B) Server not running

Check if your server is actually running:

```bash
curl http://localhost:5000/health
```

Should return:

```json
{
  "status": "success",
  "message": "Server is running!"
}
```

#### C) Firewall blocking requests

- Check Windows Firewall settings
- Temporarily disable antivirus to test
- Check if port 5000 is accessible

---

### Issue 2: Signature Verification Failed

**Symptoms:**

- Log shows: "PayHere webhook signature verification failed"
- Webhook receives request but rejects it

**Causes & Solutions:**

#### Check Merchant Secret

Your `PAYHERE_MERCHANT_SECRET` must match exactly:

1. Login to PayHere Dashboard
2. Go to Settings > Domains & Credentials
3. Copy the **Merchant Secret** (not Merchant ID!)
4. Update `.env`:

```env
PAYHERE_MERCHANT_SECRET=your_actual_merchant_secret_here
```

5. Restart server:

```bash
npm run dev
```

#### Verify Hash Generation

The hash is calculated as:

```
MD5(merchant_id + order_id + amount + currency + MD5(merchant_secret))
```

Check server logs for hash generation details.

---

### Issue 3: Wallet Not Updating

**Symptoms:**

- Payment successful
- Booking confirmed
- But wallet balance stays the same

**Diagnostic Steps:**

#### 1. Check Server Logs

Look for these messages in order:

```
📨 PayHere webhook received
✓ Webhook signature verified
🎯 Handling payment success
Processing wallet credit for studio owner
Crediting wallet - Gross: 5000, Commission: 355, Net: 4645
✓ Wallet credited successfully
```

#### 2. Check Database

```javascript
// In MongoDB shell or Compass
db.wallets.findOne({ user: ObjectId("studio_owner_id") });
```

Should show:

- `balance.available` increased
- `totalEarnings` updated
- Recent transaction in `transactions` array

#### 3. Check Booking Status

```javascript
db.bookings.findOne({ _id: ObjectId("booking_id") });
```

Should show:

- `status: "confirmed"`
- `payherePaymentId` set
- `paymentStatus: "paid"`

#### 4. Manual Wallet Credit Test

```bash
curl -X POST http://localhost:5000/api/webhooks/test-webhook \
  -H "Content-Type: application/json" \
  -d '{"bookingId": "YOUR_BOOKING_ID"}'
```

---

### Issue 4: Environment Variables Not Set

**Symptoms:**

- Server fails to start
- Error: "PayHere configuration missing"

**Solution:**

1. **Copy example file:**

```bash
cd server
cp .env.payhere.example .env
```

2. **Fill in required values:**

```env
# From PayHere Dashboard
PAYHERE_MERCHANT_ID=your_merchant_id
PAYHERE_MERCHANT_SECRET=your_merchant_secret
PAYHERE_MODE=sandbox

# Your server URL (use ngrok for localhost)
SERVER_URL=https://your-ngrok-url.ngrok.io

# Your frontend URL
CORS_ORIGIN=http://localhost:5173

# Database
MONGO_URI=mongodb://localhost:27017/ripple-studio

# JWT
JWT_SECRET=your_random_secret_key_here
```

3. **Restart server:**

```bash
npm run dev
```

---

## 🧪 Testing the Webhook

### Method 1: Test Endpoint

```bash
# Check if webhook route is accessible
curl http://localhost:5000/api/webhooks/test
```

Expected response:

```json
{
  "status": "success",
  "message": "PayHere webhook route is working"
}
```

### Method 2: Simple Test Server

```bash
# Run minimal test server
node test-webhook-server.js
```

Then test with ngrok:

```bash
ngrok http 5000
curl -X POST https://your-ngrok-url.ngrok.io/api/webhooks/payhere -d "test=data"
```

### Method 3: Manual Webhook Trigger (Development Only)

```bash
curl -X POST http://localhost:5000/api/webhooks/test-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "67890abcdef12345"
  }'
```

This bypasses PayHere and directly calls `confirmBooking()`.

### Method 4: Real Payment Test

Use PayHere sandbox test cards:

- **Card Number:** 5123 4567 8901 2346
- **CVV:** 123
- **Expiry:** Any future date (e.g., 12/25)
- **Name:** Test User

---

## 📊 Monitoring & Debugging

### Server Logs

The server logs show the complete webhook flow:

```bash
# Start server with logs
npm run dev

# Watch for these messages:
📨 PayHere webhook received          # Webhook received
✓ Webhook signature verified         # Signature OK
🎯 Handling payment success          # Processing payment
Processing wallet credit...          # Crediting wallet
Crediting wallet - Gross: X...       # Commission calculation
✓ Wallet credited successfully       # Success!
```

### Database Monitoring

Watch for changes in real-time:

```javascript
// MongoDB shell
use ripple-studio

// Watch wallet changes
db.wallets.watch()

// Watch booking changes
db.bookings.watch()
```

### Network Monitoring

Use ngrok's web interface:

1. Open http://127.0.0.1:4040 (when ngrok is running)
2. See all incoming requests
3. View request/response details
4. Check if PayHere is actually sending webhooks

---

## ✅ Verification Checklist

After making a test booking, verify:

- [ ] Payment completed successfully on PayHere
- [ ] Server received webhook (check logs: "📨 PayHere webhook received")
- [ ] Signature verified (check logs: "✓ Webhook signature verified")
- [ ] Booking status changed to "confirmed" in database
- [ ] Wallet balance increased by (amount - 7.1%)
- [ ] Wallet transaction created with correct amounts
- [ ] Studio owner can see updated balance in dashboard
- [ ] Client receives booking confirmation

---

## 🛠️ Tools & Commands Reference

### Diagnostic Tools

```bash
# Full diagnostic
node diagnose-webhook.js

# Test webhook server
node test-webhook-server.js

# Check server health
curl http://localhost:5000/health
```

### ngrok Commands

```bash
# Start ngrok
ngrok http 5000

# With custom domain (paid plan)
ngrok http 5000 --domain=your-domain.ngrok.io

# View requests
open http://127.0.0.1:4040
```

### Database Queries

```javascript
// Find wallet by user ID
db.wallets.findOne({ user: ObjectId("user_id") });

// Find recent transactions
db.wallets.aggregate([
  { $unwind: "$transactions" },
  { $sort: { "transactions.createdAt": -1 } },
  { $limit: 10 },
]);

// Find pending bookings
db.bookings.find({ status: "pending" });

// Find recent payments
db.payments.find().sort({ createdAt: -1 }).limit(10);
```

---

## 🔐 Security Notes

1. **Never commit .env file** - It contains secrets
2. **Use different secrets for dev/prod**
3. **Rotate merchant secret periodically**
4. **Monitor webhook logs for suspicious activity**
5. **Verify webhook signatures always**

---

## 📞 Still Having Issues?

If you've tried everything above and it still doesn't work:

1. **Check PayHere Status:** https://www.payhere.lk/status
2. **Review PayHere Docs:** https://support.payhere.lk/
3. **Contact PayHere Support:** support@payhere.lk
4. **Check Server Logs:** Look for any error messages
5. **Test with Postman:** Manually send webhook payload

---

## 📝 Quick Reference

### Environment Variables

| Variable                  | Description            | Example                |
| ------------------------- | ---------------------- | ---------------------- |
| `PAYHERE_MERCHANT_ID`     | From PayHere dashboard | `1234567`              |
| `PAYHERE_MERCHANT_SECRET` | From PayHere dashboard | `AbCd1234...`          |
| `PAYHERE_MODE`            | `sandbox` or `live`    | `sandbox`              |
| `SERVER_URL`              | Your public server URL | `https://abc.ngrok.io` |
| `PORT`                    | Server port            | `5000`                 |

### Important URLs

| Purpose           | URL                                 |
| ----------------- | ----------------------------------- |
| Webhook endpoint  | `{SERVER_URL}/api/webhooks/payhere` |
| Test endpoint     | `{SERVER_URL}/api/webhooks/test`    |
| Health check      | `{SERVER_URL}/health`               |
| PayHere dashboard | https://www.payhere.lk/merchant     |

### Commission Calculation

- **Platform Fee:** 7.1%
- **Studio Receives:** 92.9%
- **Example:** ₨5000 booking → ₨355 fee → ₨4645 to studio

---

## 🎯 Best Practices

1. **Always use ngrok for local development**
2. **Test with sandbox mode first**
3. **Monitor logs during test payments**
4. **Verify wallet balance after each test**
5. **Keep ngrok URL updated in PayHere dashboard**
6. **Restart server after .env changes**
7. **Check database directly when debugging**

---

**Last Updated:** October 2025
**Version:** 1.0
