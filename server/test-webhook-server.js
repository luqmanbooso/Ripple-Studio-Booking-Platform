const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple webhook test endpoint
app.post("/api/webhooks/payhere", (req, res) => {
  console.log("\n🎉 WEBHOOK RECEIVED!");
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);
  console.log("Query:", req.query);
  res.status(200).send("OK");
});

app.get("/api/webhooks/test", (req, res) => {
  console.log("✅ Test endpoint accessed");
  res.json({
    status: "success",
    message: "Webhook route is accessible",
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "success",
    message: "Test server is running",
    webhookUrl: `${req.protocol}://${req.get("host")}/api/webhooks/payhere`,
    testUrl: `${req.protocol}://${req.get("host")}/api/webhooks/test`,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("\n" + "=".repeat(60));
  console.log(`🚀 Test server running on http://localhost:${PORT}`);
  console.log("=".repeat(60));
  console.log(
    "\n📍 Webhook endpoint: http://localhost:" + PORT + "/api/webhooks/payhere"
  );
  console.log(
    "📍 Test endpoint:    http://localhost:" + PORT + "/api/webhooks/test"
  );
  console.log("📍 Health check:     http://localhost:" + PORT + "/health");
  console.log("\n💡 Test with curl:");
  console.log(`   curl http://localhost:${PORT}/api/webhooks/test`);
  console.log(
    `   curl -X POST http://localhost:${PORT}/api/webhooks/payhere -d "test=data"`
  );
  console.log("\n⚠️  Remember: Use ngrok for PayHere to reach this server!");
  console.log("   ngrok http " + PORT);
  console.log("=".repeat(60) + "\n");
});
