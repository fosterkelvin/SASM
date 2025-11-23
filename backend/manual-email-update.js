require("dotenv").config();
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: String,
  pendingEmail: String,
  verified: Boolean,
  firstname: String,
  lastname: String,
});

const User = mongoose.model("User", userSchema);

async function updateEmail() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Find the user with pending email
    const user = await User.findOne({
      email: "vinkelfoster17@gmail.com",
      pendingEmail: "20197992@s.ubaguio.edu",
    });

    if (!user) {
      console.log("User not found!");
      return;
    }

    console.log("\n=== BEFORE UPDATE ===");
    console.log("User ID:", user._id);
    console.log("Current Email:", user.email);
    console.log("Pending Email:", user.pendingEmail);
    console.log("Verified:", user.verified);

    // Update the email
    user.email = user.pendingEmail;
    user.pendingEmail = undefined;
    user.verified = true;
    await user.save();

    console.log("\n=== AFTER UPDATE ===");
    console.log("New Email:", user.email);
    console.log("Pending Email:", user.pendingEmail);
    console.log("Verified:", user.verified);

    console.log("\n✅ Email updated successfully!");
    console.log("You can now sign in with: 20197992@s.ubaguio.edu");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  }
}

updateEmail();
