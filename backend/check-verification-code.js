require("dotenv").config();
const mongoose = require("mongoose");

const verificationCodeSchema = new mongoose.Schema({
  userID: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  type: { type: String, required: true },
  createdAt: { type: Date, required: true, default: Date.now },
  expiresAt: { type: Date, required: true },
});

const VerificationCode = mongoose.model(
  "VerificationCode",
  verificationCodeSchema
);

const userSchema = new mongoose.Schema({
  email: String,
  pendingEmail: String,
  verified: Boolean,
  firstname: String,
  lastname: String,
});

const User = mongoose.model("User", userSchema);

async function checkVerificationCode() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Find the user with pending email
    const user = await User.findOne({ pendingEmail: "20197992@s.ubaguio.edu" });

    if (!user) {
      console.log("No user found with that pending email");
      return;
    }

    console.log("\n=== USER INFO ===");
    console.log("User ID:", user._id);
    console.log("Current Email:", user.email);
    console.log("Pending Email:", user.pendingEmail);
    console.log("Verified:", user.verified);

    // Find verification codes for this user
    const codes = await VerificationCode.find({ userID: user._id });

    console.log("\n=== VERIFICATION CODES ===");
    console.log("Total codes found:", codes.length);

    codes.forEach((code, index) => {
      console.log(`\nCode ${index + 1}:`);
      console.log("  ID:", code._id);
      console.log("  Type:", code.type);
      console.log("  Created At:", code.createdAt);
      console.log("  Expires At:", code.expiresAt);
      console.log("  Is Expired:", code.expiresAt < new Date());
      console.log(
        "  Verification Link: https://www.sasm.site/email/verify/" + code._id
      );
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  }
}

checkVerificationCode();
