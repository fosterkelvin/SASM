import "dotenv/config";
import { sendMail } from "./src/utils/sendMail";
import { getInterviewScheduledEmailTemplate } from "./src/utils/emailTemplate";

async function testInterviewEmail() {
  console.log("🧪 Testing Interview Scheduled Email...\n");

  try {
    console.log("📧 Generating interview email template...");

    // Test data
    const applicantName = "Kelvin Foster";
    const position = "Student Assistant";
    const interviewDate = "2025-01-30"; // Tomorrow's date
    const interviewTime = "14:30"; // 2:30 PM
    const interviewLocation = "HR Office, Room 201, Administration Building";
    const interviewNotes =
      "Please bring a valid ID, arrive 15 minutes early, and prepare for technical questions about your qualifications.";

    const emailTemplate = getInterviewScheduledEmailTemplate(
      applicantName,
      position,
      interviewDate,
      interviewTime,
      interviewLocation,
      interviewNotes
    );

    console.log("✅ Email template generated successfully!");
    console.log("📋 Subject:", emailTemplate.subject);
    console.log(
      "📄 Text preview:",
      emailTemplate.text.substring(0, 200) + "..."
    );

    // Uncomment the lines below to actually send a test email
    // const result = await sendMail({
    //   to: "your-test-email@gmail.com", // Change this to your actual email
    //   ...emailTemplate,
    // });

    // if (result.error) {
    //   console.log("❌ Email failed:");
    //   console.log(result.error);
    // } else {
    //   console.log("✅ Email sent successfully!");
    //   console.log("📧 Email ID:", result.data?.id);
    //   console.log("💡 Check your inbox (and spam folder)");
    // }

    console.log(
      "\n💡 To actually send the email, uncomment the sendMail section and add your email address."
    );
  } catch (error) {
    console.log("❌ Error:", error);
  }
}

// Run the test
testInterviewEmail();
