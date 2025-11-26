require("dotenv").config();
const mongoose = require("mongoose");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const UserSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model("User", UserSchema, "users");

const UserDataSchema = new mongoose.Schema({}, { strict: false });
const UserData = mongoose.model("UserData", UserDataSchema, "userdatas");

async function setEffectivityDate() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Find all scholars (SA/SM) without effectivity date
    const scholars = await User.find({
      status: { $in: ["SA", "SM"] },
    }).lean();

    console.log(`\n📊 Found ${scholars.length} scholars (SA/SM)`);

    // Check which ones don't have effectivity date in their userData
    const scholarsWithoutDate = [];
    for (const scholar of scholars) {
      const userData = await UserData.findOne({ userId: scholar._id }).lean();
      if (!userData || !userData.effectivityDate) {
        scholarsWithoutDate.push({
          ...scholar,
          userData: userData || null,
        });
      }
    }

    console.log(
      `\n⚠️  ${scholarsWithoutDate.length} scholars don't have effectivity date set`
    );

    if (scholarsWithoutDate.length === 0) {
      console.log("\n✅ All scholars have effectivity dates!");
      await mongoose.disconnect();
      rl.close();
      return;
    }

    console.log("\n📋 Scholars without effectivity date:");
    scholarsWithoutDate.forEach((s, i) => {
      console.log(
        `${i + 1}. ${s.firstname} ${s.lastname} (${s.status}) - ID: ${s._id}`
      );
    });

    rl.question(
      "\n❓ Do you want to set effectivity date to TODAY for all these scholars? (yes/no): ",
      async (answer) => {
        if (answer.toLowerCase() === "yes" || answer.toLowerCase() === "y") {
          const effectivityDate = new Date();
          console.log(`\n⏳ Setting effectivity date to: ${effectivityDate}`);

          let updated = 0;
          for (const scholar of scholarsWithoutDate) {
            await UserData.findOneAndUpdate(
              { userId: scholar._id },
              { effectivityDate },
              { upsert: true, new: true }
            );
            updated++;
            console.log(`✅ Updated: ${scholar.firstname} ${scholar.lastname}`);
          }

          console.log(`\n✅ Successfully updated ${updated} scholars!`);
        } else {
          console.log("\n❌ Operation cancelled");
        }

        await mongoose.disconnect();
        console.log("\n👋 Disconnected from MongoDB");
        rl.close();
      }
    );
  } catch (error) {
    console.error("❌ Error:", error);
    await mongoose.disconnect();
    rl.close();
  }
}

setEffectivityDate();
