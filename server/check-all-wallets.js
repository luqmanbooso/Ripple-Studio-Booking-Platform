require("dotenv").config();
const mongoose = require("mongoose");
require("./src/models/User"); // Load User model first
const Studio = require("./src/models/Studio");
const { Wallet, WalletTransaction } = require("./src/models/Wallet");

async function checkAllWallets() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("\n✅ Connected to database\n");

    const studios = await Studio.find().populate("user", "name email");

    console.log(`📊 Checking wallets for ${studios.length} studios:\n`);
    console.log("=".repeat(80));

    for (const studio of studios) {
      console.log(`\n🏢 ${studio.name}`);
      console.log(`   Owner: ${studio.user.name} (${studio.user.email})`);
      console.log(`   User ID: ${studio.user._id}`);

      const wallet = await Wallet.findOne({ user: studio.user._id });

      if (wallet) {
        console.log(`   ✅ Wallet exists`);
        console.log(
          `   💰 Available: LKR ${wallet.balance.available.toLocaleString()}`
        );
        console.log(
          `   📈 Total Earnings: LKR ${wallet.totalEarnings.toLocaleString()}`
        );
        console.log(
          `   💸 Total Commissions: LKR ${wallet.totalCommissions.toLocaleString()}`
        );

        const transactions = await WalletTransaction.find({
          wallet: wallet._id,
        })
          .sort({ createdAt: -1 })
          .limit(3);

        if (transactions.length > 0) {
          console.log(`   📝 Recent Transactions (${transactions.length}):`);
          transactions.forEach((tx, i) => {
            console.log(
              `      ${i + 1}. ${tx.type} - LKR ${tx.amount} (${tx.status}) - ${tx.createdAt.toLocaleDateString()}`
            );
          });
        } else {
          console.log(`   📝 No transactions yet`);
        }
      } else {
        console.log(`   ❌ No wallet found`);
      }
    }

    console.log("\n" + "=".repeat(80) + "\n");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

checkAllWallets();
