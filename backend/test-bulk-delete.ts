import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

async function testBulkDelete() {
  try {
    // You would need to replace these with actual notification IDs and a valid JWT token
    const notificationIDs = [
      "60d5ecb74e3a8a001f5d7e1f",
      "60d5ecb74e3a8a001f5d7e20",
    ];
    const token = "your-jwt-token-here";

    const response = await axios.delete(`${API_BASE_URL}/notifications/bulk`, {
      data: { notificationIDs },
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("Success:", response.data);
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
  }
}

// Uncomment to test:
// testBulkDelete();

console.log(
  "Test file created. To test, add valid notification IDs and JWT token, then uncomment the function call."
);
