import "dotenv/config";
import { Resend } from "resend";

// Test Resend configuration
async function testResend() {
  console.log("🧪 Testing Resend Configuration...\n");

  // Check environment variables
  console.log("📋 Environment Variables:");
  console.log(
    `RESEND_API_KEY: ${process.env.RESEND_API_KEY ? "✅ Set" : "❌ Missing"}`
  );
  console.log(`EMAIL_SENDER: ${process.env.EMAIL_SENDER || "❌ Missing"}`);
  console.log();

  if (!process.env.RESEND_API_KEY) {
    console.log("❌ RESEND_API_KEY is missing! Please check your .env file.");
    return;
  }

  if (!process.env.EMAIL_SENDER) {
    console.log("❌ EMAIL_SENDER is missing! Please check your .env file.");
    return;
  }

  // Initialize Resend
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    // Test API key validity by fetching domains
    console.log("🔑 Testing API Key...");
    const domains = await resend.domains.list();
    console.log("✅ API Key is valid!");

    if (domains.data) {
      console.log("� Domains found!");
      console.log("📋 Domain info:", domains.data);
    } else {
      console.log(
        "⚠️  No domains found. You need to add and verify a domain in Resend."
      );
      console.log("   Visit: https://resend.com/domains");
    }
    console.log();

    // Test sending a simple email
    console.log("📧 Testing email sending...");
    const testEmail = {
      from: process.env.EMAIL_SENDER,
      to: ["test@example.com"], // This will fail but shows if the request format is correct
      subject: "Test Email from SASM",
      text: "This is a test email to verify Resend configuration.",
      html: "<p>This is a <strong>test email</strong> to verify Resend configuration.</p>",
    };

    const result = await resend.emails.send(testEmail);

    if (result.error) {
      console.log("❌ Email sending failed:");
      console.log(`   Error: ${result.error.message}`);

      // Common error analysis
      if (result.error.message.includes("domain")) {
        console.log(
          "💡 Tip: Make sure your EMAIL_SENDER uses a verified domain in Resend."
        );
        console.log("   Current EMAIL_SENDER:", process.env.EMAIL_SENDER);
      }
      if (result.error.message.includes("recipient")) {
        console.log(
          "💡 Note: test@example.com is expected to fail. This tests the API connection."
        );
      }
    } else {
      console.log("✅ Email API call successful!");
      console.log(`   Email ID: ${result.data?.id}`);
    }
  } catch (error) {
    console.log("❌ Error testing Resend:");
    console.log(`   ${error}`);

    if (error instanceof Error && error.message?.includes("Invalid API key")) {
      console.log(
        "💡 Tip: Check if your RESEND_API_KEY is correct and starts with 're_'"
      );
    }
  }

  console.log("\n🔍 Common Issues:");
  console.log(
    "1. API Key: Make sure it starts with 're_' and is from resend.com"
  );
  console.log(
    "2. Domain: EMAIL_SENDER must use a verified domain in your Resend account"
  );
  console.log(
    "3. Recipient: Make sure the recipient email is valid and not blacklisted"
  );
  console.log(
    "4. Rate Limits: Check if you've exceeded your Resend rate limits"
  );
}

testResend().catch(console.error);
