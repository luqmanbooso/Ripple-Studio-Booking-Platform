/**
 * Check Recent Wallet Transactions
 */

require("dotenv").config();
const mongoose = require("mongoose");

async function checkRecentTransactions() {
  try {
    console.log("\n🔍 Checking recent wallet transactions...\n");

    await mongoose.connect(process.env.MONGO_URI);

    const { WalletTransaction } = require("./src/models/Wallet");

    // Get recent transactions
    const transactions = await WalletTransaction.find({})
      .sort({ createdAt: -1 })
      .limit(20);

    if (transactions.length === 0) {
      console.log("❌ No wallet transactions found.\n");
      process.exit(0);
    }

    console.log(`✅ Found ${transactions.length} recent transaction(s)\n`);
    console.log("=".repeat(80));

    let totalAmount = 0;

    transactions.forEach((tx, index) => {
      console.log(`\n💳 Transaction #${index + 1}:`);
      console.log(`   ID: ${tx._id}`);
      console.log(`   Type: ${tx.type}`);
      console.log(`   Amount: LKR ${tx.amount?.toLocaleString() || 0}`);
      console.log(`   Net Amount: LKR ${tx.netAmount?.toLocaleString() || 0}`);
      console.log(`   Commission: LKR ${tx.commission?.toLocaleString() || 0}`);
      console.log(`   Status: ${tx.status}`);
      console.log(`   Payment ID: ${tx.paymentId || "N/A"}`);
      console.log(`   Created: ${tx.createdAt}`);

      if (tx.type === "credit") {
        totalAmount += tx.netAmount || 0;
      }
    });

    console.log("\n" + "=".repeat(80));
    console.log(`\n💰 Total Credits: LKR ${totalAmount.toLocaleString()}\n`);

    await mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

checkRecentTransactions();
