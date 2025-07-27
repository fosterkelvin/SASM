import "dotenv/config";
import { sendMail } from "./src/utils/sendMail";
import { getVerifyEmailTemplate } from "./src/utils/emailTemplate";

async function testRealEmail() {
  console.log("🧪 Testing Real Email Delivery...\n");

  const testUrl = "http://localhost:5173/email/verify/test123";

  try {
    console.log("📧 Sending test verification email...");
    const result = await sendMail({
      to: "your-test-email@gmail.com", // Change this to your actual email
      ...getVerifyEmailTemplate(testUrl),
    });

    if (result.error) {
      console.log("❌ Email failed:");
      console.log(result.error);
    } else {
      console.log("✅ Email sent successfully!");
      console.log("📧 Email ID:", result.data?.id);
      console.log("💡 Check your inbox (and spam folder)");
    }
  } catch (error) {
    console.log("❌ Error:", error);
  }
}

// Only run if called directly (uncomment the line below and change the email)
// testRealEmail();
