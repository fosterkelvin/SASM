const {
  updateApplicationStatusSchema,
} = require("./dist/controllers/application.schemas.js");

// Test the new status values
const testStatuses = [
  "failed_interview",
  "passed_interview",
  "accepted",
  "withdrawn",
  "on_hold",
  "pending",
  "under_review",
  "interview_scheduled",
  "rejected",
];

console.log("Testing status validation...\n");

testStatuses.forEach((status) => {
  try {
    const result = updateApplicationStatusSchema.parse({
      status: status,
      hrComments: "Test comment",
    });
    console.log(`✅ ${status}: VALID`);
  } catch (error) {
    console.log(`❌ ${status}: INVALID - ${error.message}`);
  }
});

console.log("\nTesting invalid status...");
try {
  updateApplicationStatusSchema.parse({
    status: "invalid_status",
    hrComments: "Test comment",
  });
  console.log("❌ invalid_status: Should have failed but didn't");
} catch (error) {
  console.log("✅ invalid_status: Correctly rejected");
}
