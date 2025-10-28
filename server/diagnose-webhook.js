require("dotenv").config();
const chalk = require("chalk");

console.log("\n" + "=".repeat(60));
console.log(chalk.bold.cyan("  🔍 PayHere Webhook Diagnostic Tool"));
console.log("=".repeat(60) + "\n");

// Check environment variables
console.log(chalk.bold.yellow("1. Environment Variables Check:"));
console.log("-".repeat(60));

const requiredVars = {
  PAYHERE_MERCHANT_ID: process.env.PAYHERE_MERCHANT_ID,
  PAYHERE_MERCHANT_SECRET: process.env.PAYHERE_MERCHANT_SECRET,
  PAYHERE_MODE: process.env.PAYHERE_MODE,
  SERVER_URL: process.env.SERVER_URL,
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI,
};

let missingVars = [];
Object.entries(requiredVars).forEach(([key, value]) => {
  if (!value) {
    console.log(chalk.red(`❌ ${key}: NOT SET`));
    missingVars.push(key);
  } else {
    if (key === "PAYHERE_MERCHANT_SECRET") {
      console.log(chalk.green(`✅ ${key}: ${value.substring(0, 10)}...`));
    } else if (key === "MONGO_URI") {
      console.log(chalk.green(`✅ ${key}: ${value.substring(0, 20)}...`));
    } else {
      console.log(chalk.green(`✅ ${key}: ${value}`));
    }
  }
});

// Webhook URL check
console.log("\n" + chalk.bold.yellow("2. Webhook URL Configuration:"));
console.log("-".repeat(60));

const serverUrl =
  process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`;
const webhookUrl = `${serverUrl}/api/webhooks/payhere`;

console.log(chalk.cyan("Expected webhook URL: ") + chalk.white(webhookUrl));

if (webhookUrl.includes("localhost")) {
  console.log(
    chalk.yellow(
      "\n⚠️  WARNING: Using localhost URL - PayHere cannot reach this!"
    )
  );
  console.log(chalk.white("   You need to use ngrok or similar tool:"));
  console.log(chalk.cyan("   1. Install ngrok: ") + "npm install -g ngrok");
  console.log(
    chalk.cyan("   2. Start ngrok: ") + `ngrok http ${process.env.PORT || 5000}`
  );
  console.log(
    chalk.cyan("   3. Update .env: ") + "SERVER_URL=https://your-ngrok-url"
  );
  console.log(
    chalk.cyan("   4. Configure in PayHere: ") +
      "Settings > API Configuration > Notify URL"
  );
} else {
  console.log(chalk.green("✅ Using public URL - PayHere can reach this"));
}

// Database check
console.log("\n" + chalk.bold.yellow("3. Database Connection:"));
console.log("-".repeat(60));

if (process.env.MONGO_URI) {
  console.log(
    chalk.green("✅ MongoDB URI configured: ") +
      chalk.white(process.env.MONGO_URI.substring(0, 30) + "...")
  );
} else {
  console.log(chalk.red("❌ MongoDB URI not configured"));
  missingVars.push("MONGO_URI");
}

// Routes check
console.log("\n" + chalk.bold.yellow("4. Webhook Routes Status:"));
console.log("-".repeat(60));

console.log(chalk.cyan("Expected routes:"));
console.log(chalk.white("  GET  ") + webhookUrl.replace("/payhere", "/test"));
console.log(chalk.white("  POST ") + webhookUrl);
console.log(
  chalk.white("  POST ") +
    webhookUrl.replace("/payhere", "/test-webhook") +
    chalk.yellow(" (dev only)")
);

// PayHere configuration check
console.log("\n" + chalk.bold.yellow("5. PayHere Configuration:"));
console.log("-".repeat(60));

const mode = process.env.PAYHERE_MODE || "sandbox";
console.log(
  chalk.cyan("Mode: ") +
    chalk.white(mode) +
    (mode === "sandbox" ? chalk.yellow(" (testing)") : chalk.green(" (live)"))
);

if (mode === "sandbox") {
  console.log(
    chalk.yellow("\n💡 Using sandbox mode - use PayHere test cards:")
  );
  console.log(chalk.white("   Card: 5123 4567 8901 2346"));
  console.log(chalk.white("   CVV: 123"));
  console.log(chalk.white("   Expiry: Any future date"));
}

// Summary
console.log("\n" + chalk.bold.yellow("6. Diagnostic Summary:"));
console.log("-".repeat(60));

if (missingVars.length > 0) {
  console.log(
    chalk.red.bold(
      `\n❌ ISSUES FOUND: ${missingVars.length} missing variable(s)`
    )
  );
  console.log(
    chalk.white("\nMissing variables: ") + chalk.red(missingVars.join(", "))
  );
  console.log(chalk.yellow("\n📝 Action required:"));
  console.log(chalk.white("   1. Copy .env.payhere.example to .env"));
  console.log(chalk.white("   2. Fill in your PayHere credentials"));
  console.log(chalk.white("   3. Restart the server: npm run dev"));
} else {
  console.log(chalk.green.bold("\n✅ All environment variables configured!"));
}

// Ngrok check
if (webhookUrl.includes("localhost")) {
  console.log(chalk.yellow("\n⚠️  Localhost detected - webhook won't work"));
  console.log(chalk.white("\n📝 To fix:"));
  console.log(chalk.cyan("   Step 1: ") + "Install ngrok globally");
  console.log(chalk.white("           npm install -g ngrok"));
  console.log(chalk.cyan("\n   Step 2: ") + "Start ngrok tunnel");
  console.log(chalk.white(`           ngrok http ${process.env.PORT || 5000}`));
  console.log(chalk.cyan("\n   Step 3: ") + "Copy the https URL from ngrok");
  console.log(chalk.white("           Example: https://abc123.ngrok.io"));
  console.log(chalk.cyan("\n   Step 4: ") + "Update your .env file");
  console.log(chalk.white("           SERVER_URL=https://abc123.ngrok.io"));
  console.log(chalk.cyan("\n   Step 5: ") + "Update PayHere dashboard");
  console.log(
    chalk.white(
      "           Notify URL: https://abc123.ngrok.io/api/webhooks/payhere"
    )
  );
  console.log(chalk.cyan("\n   Step 6: ") + "Restart server");
  console.log(chalk.white("           npm run dev"));
}

console.log("\n" + chalk.bold.yellow("7. Testing the Webhook:"));
console.log("-".repeat(60));
console.log(chalk.white("Once ngrok is running, test the webhook route:"));
console.log(
  chalk.cyan("\n   Browser test: ") +
    webhookUrl
      .replace("localhost", "YOUR_NGROK_URL")
      .replace("/payhere", "/test")
);
console.log(
  chalk.cyan("   Or with curl: ") +
    `curl ${webhookUrl.replace("localhost", "YOUR_NGROK_URL")}/test`
);

console.log("\n" + chalk.bold.yellow("8. Common Issues & Solutions:"));
console.log("-".repeat(60));
console.log(
  chalk.white("Issue 1: ") + chalk.red("Webhook not receiving requests")
);
console.log(
  chalk.yellow("  → ") + "Make sure ngrok is running and URL is updated"
);
console.log(
  chalk.yellow("  → ") + "Check PayHere dashboard has correct notify URL"
);
console.log(chalk.yellow("  → ") + "Verify server is actually running");

console.log(
  chalk.white("\nIssue 2: ") + chalk.red("Signature verification failed")
);
console.log(chalk.yellow("  → ") + "Check PAYHERE_MERCHANT_SECRET is correct");
console.log(
  chalk.yellow("  → ") +
    "Merchant secret from PayHere dashboard Settings > Domains"
);

console.log(chalk.white("\nIssue 3: ") + chalk.red("Wallet not updating"));
console.log(
  chalk.yellow("  → ") + "Check server logs for wallet crediting messages"
);
console.log(
  chalk.yellow("  → ") + "Verify booking status changed to 'confirmed'"
);
console.log(chalk.yellow("  → ") + "Check wallet transaction was created");

console.log("\n" + chalk.bold.yellow("9. Useful Commands:"));
console.log("-".repeat(60));
console.log(chalk.cyan("Check if server is running:"));
console.log(
  chalk.white(`  curl http://localhost:${process.env.PORT || 5000}/health`)
);
console.log(chalk.cyan("\nTest webhook endpoint:"));
console.log(
  chalk.white(
    `  curl http://localhost:${process.env.PORT || 5000}/api/webhooks/test`
  )
);
console.log(chalk.cyan("\nWatch server logs:"));
console.log(chalk.white("  npm run dev (shows logs in terminal)"));

console.log("\n" + "=".repeat(60));
console.log(chalk.bold.green("  Diagnostic complete! "));
console.log("=".repeat(60) + "\n");

// Exit
process.exit(missingVars.length > 0 ? 1 : 0);
