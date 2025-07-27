import "dotenv/config";
import { sendMail } from "./src/utils/sendMail";
import { getInterviewResultEmailTemplate } from "./src/utils/emailTemplate";

async function testInterviewResultEmails() {
  console.log("🧪 Testing Interview Result Emails...\n");

  try {
    // Test passed interview email
    console.log("📧 Testing PASSED interview email template...");
    const passedEmailTemplate = getInterviewResultEmailTemplate(
      "Kelvin Foster",
      "Student Assistant",
      true, // passed = true
      "Great performance during the interview! You demonstrated excellent communication skills and showed enthusiasm for the role."
    );

    console.log("✅ Passed interview email template generated!");
    console.log("📋 Subject:", passedEmailTemplate.subject);
    console.log(
      "📄 Text preview:",
      passedEmailTemplate.text.substring(0, 150) + "...\n"
    );

    // Test failed interview email
    console.log("📧 Testing FAILED interview email template...");
    const failedEmailTemplate = getInterviewResultEmailTemplate(
      "Kelvin Foster",
      "Student Assistant",
      false, // passed = false
      "Thank you for your time. While your enthusiasm was evident, we felt that other candidates had more relevant experience for this specific role. We encourage you to apply for future opportunities."
    );

    console.log("✅ Failed interview email template generated!");
    console.log("📋 Subject:", failedEmailTemplate.subject);
    console.log(
      "📄 Text preview:",
      failedEmailTemplate.text.substring(0, 150) + "...\n"
    );

    // Uncomment the lines below to actually send test emails
    // console.log("📨 Sending test emails...");
    //
    // const passedResult = await sendMail({
    //   to: "your-test-email@gmail.com", // Change this to your actual email
    //   ...passedEmailTemplate,
    // });
    //
    // const failedResult = await sendMail({
    //   to: "your-test-email@gmail.com", // Change this to your actual email
    //   ...failedEmailTemplate,
    // });

    // if (passedResult.error || failedResult.error) {
    //   console.log("❌ Some emails failed to send");
    // } else {
    //   console.log("✅ Both emails sent successfully!");
    //   console.log("💡 Check your inbox (and spam folder)");
    // }

    console.log(
      "💡 To actually send the emails, uncomment the sendMail section and add your email address."
    );
  } catch (error) {
    console.log("❌ Error:", error);
  }
}

// Run the test
testInterviewResultEmails();
