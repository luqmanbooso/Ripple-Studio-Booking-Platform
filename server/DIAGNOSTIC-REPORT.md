# 🔍 Webhook Diagnostic Summary

## Issue Identified

**Problem:** PayHere webhooks are not reaching your server because you're using `localhost`.

**Status:** ❌ **Not Working** - PayHere cannot send webhooks to `http://localhost:5000`

---

## ✅ Environment Check

Your environment variables are correctly configured:

| Variable                | Status     | Value                 |
| ----------------------- | ---------- | --------------------- |
| PAYHERE_MERCHANT_ID     | ✅ Set     | 1232121               |
| PAYHERE_MERCHANT_SECRET | ✅ Set     | ****\*\*\*****        |
| PAYHERE_MODE            | ✅ Set     | sandbox               |
| SERVER_URL              | ⚠️ Problem | http://localhost:5000 |
| MONGO_URI               | ✅ Set     | Connected             |

---

## 🚨 Root Cause

**The webhook URL is set to localhost:**

```
http://localhost:5000/api/webhooks/payhere
```

PayHere servers **cannot** reach localhost URLs. When a customer makes a payment, PayHere tries to send a webhook notification to your server, but it fails because `localhost` is only accessible from your computer, not from PayHere's servers.

---

## ✅ Solution: Use ngrok

ngrok creates a secure tunnel from a public URL to your localhost server, allowing PayHere to reach your webhook endpoint.

### Quick Fix (5 minutes):

#### Step 1: Install ngrok

```bash
npm install -g ngrok
```

#### Step 2: Start ngrok (keep this running)

```bash
ngrok http 5000
```

You'll see output like:

```
Session Status                online
Forwarding                    https://abc123-456.ngrok-free.app -> http://localhost:5000
```

#### Step 3: Copy the HTTPS URL

Copy the forwarding URL (e.g., `https://abc123-456.ngrok-free.app`)

#### Step 4: Update your .env file

```env
SERVER_URL=https://abc123-456.ngrok-free.app
```

#### Step 5: Update PayHere Dashboard

1. Login to [PayHere Merchant Dashboard](https://www.payhere.lk/merchant)
2. Go to **Settings** → **Domains & Credentials**
3. Find **API Configuration** section
4. Set **Notify URL**: `https://abc123-456.ngrok-free.app/api/webhooks/payhere`
5. Click **Save**

#### Step 6: Restart Your Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

---

## 🎯 Verification

After setup, you should see in your server logs:

```
============================================================
🚀 Server running on port 5000
============================================================
📊 Health check: http://localhost:5000/health
🌍 Environment: development

🔔 PayHere Webhook Configuration:
   Webhook URL: https://abc123-456.ngrok-free.app/api/webhooks/payhere
   Test URL:    https://abc123-456.ngrok-free.app/api/webhooks/test
   Merchant ID: 1232121
   Mode: sandbox

✅ Using public URL: https://abc123-456.ngrok-free.app
   PayHere webhooks should work correctly
```

---

## 🧪 Test Payment Flow

1. **Start your server:**

   ```bash
   npm run dev
   ```

2. **Start ngrok in another terminal:**

   ```bash
   ngrok http 5000
   ```

3. **Make a test booking** on your frontend

4. **Use PayHere test card:**
   - Card: 5123 4567 8901 2346
   - CVV: 123
   - Expiry: 12/25

5. **Watch server logs** for these messages:

   ```
   📨 PayHere webhook received
   ✓ Webhook signature verified
   🎯 Handling payment success
   Processing wallet credit for studio owner
   Crediting wallet - Gross: 5000, Commission: 355, Net: 4645
   ✓ Wallet credited successfully
   ```

6. **Check wallet dashboard** - Balance should increase by (payment - 7.1%)

---

## 📝 Helpful Commands

```bash
# Diagnose issues
npm run diagnose

# Start test webhook server
npm run test-webhook

# Start ngrok (keep running)
ngrok http 5000

# Test webhook endpoint
curl http://localhost:5000/api/webhooks/test

# Check server health
curl http://localhost:5000/health
```

---

## 🔄 Important Notes

1. **Keep ngrok running** - If you stop ngrok, webhooks will stop working
2. **URL changes** - Free ngrok URLs change every time you restart. Update .env and PayHere when this happens
3. **Paid ngrok** - Get a static URL with ngrok paid plan ($8/month)
4. **Production** - Use a real domain (not ngrok) for production deployments

---

## 📚 Additional Resources

- **Full troubleshooting guide:** See `WEBHOOK-TROUBLESHOOTING.md`
- **PayHere documentation:** https://support.payhere.lk/
- **ngrok documentation:** https://ngrok.com/docs

---

## ❓ Common Questions

### Q: Why can't PayHere reach localhost?

**A:** Localhost is only accessible from your computer. PayHere servers are on the internet and need a public URL to send webhooks to.

### Q: Do I need ngrok for production?

**A:** No. Use a proper domain name (e.g., yourapp.com) when deploying to a real server.

### Q: My ngrok URL keeps changing. What should I do?

**A:** Free ngrok URLs change on restart. Either:

- Get a paid ngrok plan for a static URL
- Update .env and PayHere each time
- Deploy to a real server with a domain name

### Q: Is ngrok safe?

**A:** Yes, ngrok is widely used for development. It creates a secure tunnel and is trusted by developers worldwide.

### Q: Can I use something other than ngrok?

**A:** Yes! Alternatives include:

- localtunnel (free)
- serveo (free)
- localhost.run (free)
- cloudflare tunnel (free)

---

**Date:** October 28, 2025  
**Status:** Issue diagnosed - awaiting ngrok setup  
**Next Steps:** Follow the solution steps above
