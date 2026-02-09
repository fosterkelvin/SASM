// Cleanup script to remove duplicate scholar records
// Run with: node cleanup-duplicate-scholar-records.js

const mongoose = require("mongoose");
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI;

async function cleanupDuplicates() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    const db = mongoose.connection.db;
    const collection = db.collection("scholarrecords");

    // Find all records
    const allRecords = await collection.find({}).toArray();
    console.log(`Total scholar records: ${allRecords.length}`);

    // Group by userId + semesterYear
    const groups = {};
    for (const record of allRecords) {
      const key = `${record.userId.toString()}_${record.semesterYear}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(record);
    }

    // Find duplicates
    const duplicateGroups = Object.entries(groups).filter(([_, records]) => records.length > 1);
    console.log(`Found ${duplicateGroups.length} groups with duplicates`);

    let deletedCount = 0;
    for (const [key, records] of duplicateGroups) {
      // Sort by recordedAt descending (keep the newest)
      records.sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt));
      
      // Keep the first one, delete the rest
      const toDelete = records.slice(1);
      console.log(`\nGroup: ${key}`);
      console.log(`  Keeping: ${records[0]._id} (recorded: ${records[0].recordedAt})`);
      
      for (const dup of toDelete) {
        console.log(`  Deleting: ${dup._id} (recorded: ${dup.recordedAt})`);
        await collection.deleteOne({ _id: dup._id });
        deletedCount++;
      }
    }

    console.log(`\n✅ Deleted ${deletedCount} duplicate records`);

    // Verify final count
    const finalCount = await collection.countDocuments();
    console.log(`Final record count: ${finalCount}`);

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  }
}

cleanupDuplicates();
