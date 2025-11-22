require("dotenv").config();
const mongoose = require("mongoose");

async function testUsersQuery() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const users = await mongoose.connection.db
      .collection("users")
      .find({})
      .toArray();
    console.log(`Found ${users.length} users`);
    console.log("First user:", JSON.stringify(users[0], null, 2));

    await mongoose.disconnect();
  } catch (error) {
    console.error("Error:", error);
  }
}

testUsersQuery();
