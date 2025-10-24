export const getPasswordResetTemplate = (url: string) => ({
  subject: "Password Reset Request",
  text: `You requested a password reset. Click on the link to reset your password: ${url}`,
  html: `<!doctype html><html lang="en-US"><head><meta content="text/html; charset=utf-8" http-equiv="Content-Type"/><title>Reset Password Email Template</title><meta name="description" content="Reset Password Email Template."><style type="text/css">a:hover{text-decoration:underline!important}</style></head><body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0"><!--100%body table--><table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8" style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;"><tr><td><table style="background-color: #f2f3f8; max-width:670px;  margin:0 auto;" width="100%" border="0" align="center" cellpadding="0" cellspacing="0"><tr><td style="height:80px;">&nbsp;</td></tr><tr><td style="text-align:center;"></a></td></tr><tr><td style="height:20px;">&nbsp;</td></tr><tr><td><table width="95%" border="0" align="center" cellpadding="0" cellspacing="0" style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);"><tr><td style="height:40px;">&nbsp;</td></tr><tr><td style="padding:0 35px;"><h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">You have requested to reset your password</h1><span style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span><p style="color:#455056; font-size:15px;line-height:24px; margin:0;">A unique link to reset your password has been generated for you. To reset your password, click the following link and follow the instructions.</p><a target="_blank" href="${url}" style="background:#2f89ff;text-decoration:none !important; font-weight:500; margin-top:24px; color:#fff;text-transform:uppercase; font-size:14px;padding:10px 24px;display:inline-block;border-radius:50px;">Reset Password</a></td></tr><tr><td style="height:40px;">&nbsp;</td></tr></table></td><tr><td style="height:20px;">&nbsp;</td></tr><tr><td style="text-align:center;"><p style="font-size:14px; color:rgba(69, 80, 86, 0.7411764705882353); line-height:18px; margin:0 0 0;">&copy;</p></td></tr><tr><td style="height:80px;">&nbsp;</td></tr></table></td></tr></table><!--/100%body table--></body></html>`,
});

export const getVerifyEmailTemplate = (url: string) => ({
  subject:
    "Verify Your Email Address - University of Baguio Student Application",
  text: `Welcome to the University of Baguio Student Application Management System!

To complete your registration and access your application portal, please verify your email address by clicking the link below:

${url}

This verification link will expire in 24 hours for security purposes.

Why verify your email?
• Secure access to your application portal
• Receive important updates about your application
• Ensure we can contact you regarding your application status

If you didn't create an account, please ignore this email.

Need help? Contact our support team.

Best regards,
University of Baguio
Student Application Management System`,
  html: `<!doctype html>
<html lang="en-US">
<head>
  <meta content="text/html; charset=utf-8" http-equiv="Content-Type"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email Address</title>
  <meta name="description" content="Verify your email address to complete registration.">
  <style type="text/css">
    body { margin: 0; padding: 0; }
    a:hover{text-decoration:underline!important}
    .verify-box {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 30px;
      border-radius: 10px;
      text-align: center;
      margin: 25px 0;
    }
    .verify-button {
      background: #fff;
      color: #667eea;
      text-decoration: none !important;
      font-weight: 600;
      padding: 15px 40px;
      display: inline-block;
      border-radius: 50px;
      font-size: 16px;
      margin-top: 20px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    }
    .verify-button:hover {
      box-shadow: 0 6px 20px rgba(0,0,0,0.3);
    }
    .info-box {
      background-color: #e3f2fd;
      border-left: 4px solid #2196f3;
      padding: 20px;
      margin: 20px 0;
      border-radius: 5px;
    }
    .benefits-list {
      text-align: left;
      margin: 20px 0;
    }
    .benefit-item {
      margin: 12px 0;
      padding-left: 30px;
      position: relative;
    }
    .benefit-item:before {
      content: "✓";
      position: absolute;
      left: 0;
      color: #4caf50;
      font-weight: bold;
      font-size: 20px;
    }
  </style>
</head>
<body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0">
  <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8" style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
    <tr>
      <td>
        <table style="background-color: #f2f3f8; max-width:670px; margin:0 auto;" width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
          <tr><td style="height:80px;">&nbsp;</td></tr>
          <tr>
            <td>
              <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0" style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                <tr><td style="height:40px;">&nbsp;</td></tr>
                <tr>
                  <td style="padding:0 35px;">
                    <h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">✉️ Welcome!</h1>
                    <p style="color:#455056; font-size:16px;line-height:24px; margin:20px 0;">
                      Thank you for registering with the <strong>University of Baguio Student Application Management System</strong>.
                    </p>

                    <div class="verify-box">
                      <h2 style="color:#fff; margin:0; font-size:24px;">Verify Your Email Address</h2>
                      <p style="color:#fff; margin:15px 0; font-size:15px;">
                        Click the button below to complete your registration
                      </p>
                      <a href="${url}" class="verify-button">
                        Verify Email Address
                      </a>
                      <p style="color:#fff; margin:15px 0 0 0; font-size:13px;">
                        ⏰ This link expires in 24 hours
                      </p>
                    </div>

                    <div class="info-box">
                      <h3 style="color:#1976d2; margin:0 0 15px 0; font-size:18px;">📋 Why Verify?</h3>
                      <div class="benefits-list">
                        <div class="benefit-item" style="color:#0c5460;">
                          <strong>Secure Access</strong> - Protect your application portal
                        </div>
                        <div class="benefit-item" style="color:#0c5460;">
                          <strong>Stay Updated</strong> - Receive important notifications
                        </div>
                        <div class="benefit-item" style="color:#0c5460;">
                          <strong>Application Status</strong> - Track your progress in real-time
                        </div>
                      </div>
                    </div>

                    <p style="color:#455056; font-size:14px;line-height:22px; margin:25px 0;">
                      <strong>Having trouble?</strong> Copy and paste this link into your browser:<br>
                      <span style="color:#2f89ff; word-break: break-all;">${url}</span>
                    </p>

                    <p style="color:#888; font-size:14px;line-height:22px; margin:20px 0;">
                      If you didn't create this account, please ignore this email. Your email address will not be used without verification.
                    </p>

                    <p style="color:#455056; font-size:16px;line-height:24px; margin:25px 0;">
                      Best regards,<br>
                      <strong>University of Baguio</strong><br>
                      Student Application Management System
                    </p>
                  </td>
                </tr>
                <tr><td style="height:40px;">&nbsp;</td></tr>
              </table>
            </td>
          </tr>
          <tr><td style="height:20px;">&nbsp;</td></tr>
          <tr>
            <td style="text-align:center;">
              <p style="font-size:14px; color:rgba(69, 80, 86, 0.7411764705882353); line-height:18px; margin:0 0 0;">&copy; Student Application Management System - University of Baguio</p>
            </td>
          </tr>
          <tr><td style="height:80px;">&nbsp;</td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
});

// Psychometric test scheduled email template with complete details
export const getPsychometricTestScheduledEmailTemplate = (
  applicantName: string,
  position: string,
  testDate: string,
  testTime: string,
  testLocation: string,
  whatToBring: string
) => ({
  subject: `Psychometric Test Scheduled - ${position} Scholarship`,
  text: `Dear ${applicantName},

Congratulations! Your application for the ${position} scholarship has been reviewed and we would like to invite you for a psychometric test.

Test Details:
Date: ${testDate}
Time: ${testTime}
Location: ${testLocation}

What to Bring:
${whatToBring}

IMPORTANT REMINDERS:
• Please arrive 15 minutes before the scheduled time
• Bring a valid government-issued ID for verification
• Late arrivals may not be accommodated due to test integrity
• The test will take approximately 60-90 minutes to complete

Please confirm your attendance by replying to this email. If you need to reschedule, please contact us at least 24 hours in advance.

We look forward to seeing you at the test. Good luck!

Best regards,
HR Department
University of Baguio`,
  html: `<!doctype html>
<html lang="en-US">
<head>
  <meta content="text/html; charset=utf-8" http-equiv="Content-Type"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Psychometric Test Scheduled</title>
  <meta name="description" content="Psychometric Test Scheduled Email Template.">
  <style type="text/css">
    body { margin: 0; padding: 0; }
    a:hover{text-decoration:underline!important}
    .test-details {
      background-color: #f8f9fa;
      border-left: 4px solid #6c757d;
      padding: 20px;
      margin: 20px 0;
      border-radius: 5px;
    }
    .detail-row {
      margin: 12px 0;
      padding: 8px 0;
      border-bottom: 1px solid #e9ecef;
    }
    .detail-label {
      font-weight: 600;
      color: #495057;
      display: inline-block;
      min-width: 120px;
    }
    .detail-value {
      color: #212529;
      font-weight: 500;
    }
    .what-to-bring {
      background-color: #fff3cd;
      border: 2px solid #ffc107;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .reminders {
      background-color: #d1ecf1;
      border-left: 4px solid #17a2b8;
      padding: 20px;
      margin: 20px 0;
      border-radius: 5px;
    }
    .reminder-item {
      margin: 10px 0;
      padding-left: 25px;
      position: relative;
    }
    .reminder-item:before {
      content: "✓";
      position: absolute;
      left: 0;
      color: #17a2b8;
      font-weight: bold;
      font-size: 18px;
    }
    @media only screen and (max-width: 600px) {
      .detail-label { min-width: 100px; font-size: 14px; }
      .detail-value { font-size: 14px; }
    }
  </style>
</head>
<body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0">
  <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8" style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
    <tr>
      <td>
        <table style="background-color: #f2f3f8; max-width:670px; margin:0 auto;" width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
          <tr><td style="height:80px;">&nbsp;</td></tr>
          <tr>
            <td>
              <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0" style="max-width:670px;background:#fff; border-radius:3px; text-align:left;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                <tr><td style="height:40px;">&nbsp;</td></tr>
                <tr>
                  <td style="padding:0 35px;">
                    <h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:28px;font-family:'Rubik',sans-serif; margin-bottom: 10px;">🎯 Psychometric Test Scheduled!</h1>
                    <p style="color:#455056; font-size:16px;line-height:24px; margin:20px 0;">
                      Dear <strong>${applicantName}</strong>,
                    </p>
                    <p style="color:#455056; font-size:16px;line-height:24px; margin:15px 0;">
                      Congratulations! Your application for the <strong>${position}</strong> scholarship has been reviewed and we would like to invite you for a psychometric test. This test will help us assess your aptitude and compatibility for the role.
                    </p>

                    <div class="test-details">
                      <h3 style="color:#495057; margin:0 0 15px 0; font-size:18px;">📋 Test Details</h3>
                      <div class="detail-row">
                        <span class="detail-label">📅 Date:</span>
                        <span class="detail-value">${testDate}</span>
                      </div>
                      <div class="detail-row">
                        <span class="detail-label">🕐 Time:</span>
                        <span class="detail-value">${testTime}</span>
                      </div>
                      <div class="detail-row" style="border-bottom: none;">
                        <span class="detail-label">📍 Location:</span>
                        <span class="detail-value">${testLocation}</span>
                      </div>
                    </div>

                    <div class="what-to-bring">
                      <h3 style="color:#856404; margin:0 0 15px 0; font-size:18px;">🎒 What to Bring:</h3>
                      <p style="color:#856404; margin:0; line-height:24px; white-space: pre-line;">${whatToBring}</p>
                    </div>

                    <div class="reminders">
                      <h3 style="color:#0c5460; margin:0 0 15px 0; font-size:18px;">⚠️ Important Reminders:</h3>
                      <div class="reminder-item" style="color:#0c5460;">
                        <strong>Arrive 15 minutes early</strong> - This allows time for check-in and orientation
                      </div>
                      <div class="reminder-item" style="color:#0c5460;">
                        <strong>Bring valid ID</strong> - Government-issued ID required for verification
                      </div>
                      <div class="reminder-item" style="color:#0c5460;">
                        <strong>Punctuality is crucial</strong> - Late arrivals may not be accommodated
                      </div>
                      <div class="reminder-item" style="color:#0c5460;">
                        <strong>Duration:</strong> Approximately 60-90 minutes
                      </div>
                    </div>

                    <p style="color:#455056; font-size:16px;line-height:24px; margin:20px 0;">
                      <strong>📧 Please confirm your attendance</strong> by replying to this email. If you need to reschedule, please contact us at least <strong>24 hours in advance</strong>.
                    </p>

                    <p style="color:#455056; font-size:16px;line-height:24px; margin:20px 0;">
                      We look forward to seeing you at the test. Take your time, stay calm, and do your best. Good luck!
                    </p>

                    <p style="color:#455056; font-size:16px;line-height:24px; margin:20px 0;">
                      Best regards,<br>
                      <strong>HR Department</strong><br>
                      <strong>University of Baguio</strong>
                    </p>
                  </td>
                </tr>
                <tr><td style="height:40px;">&nbsp;</td></tr>
              </table>
            </td>
          </tr>
          <tr><td style="height:20px;">&nbsp;</td></tr>
          <tr>
            <td style="text-align:center;">
              <p style="font-size:14px; color:rgba(69, 80, 86, 0.7411764705882353); line-height:18px; margin:0 0 0;">&copy; Student Application Management System - University of Baguio</p>
            </td>
          </tr>
          <tr><td style="height:80px;">&nbsp;</td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
});

// Interview scheduled email template with complete details
export const getInterviewScheduledEmailTemplate = (
  applicantName: string,
  position: string,
  interviewDate: string,
  interviewTime: string,
  interviewLocation: string,
  whatToBring: string,
  interviewNotes?: string
) => ({
  subject: `Interview Scheduled - ${position} Scholarship`,
  text: `Dear ${applicantName},

Congratulations! Your application for the ${position} scholarship has been reviewed and we would like to invite you for an interview.

Interview Details:
Date: ${interviewDate}
Time: ${interviewTime}
Location: ${interviewLocation}

What to Bring:
${whatToBring}

${interviewNotes ? `Additional Notes: ${interviewNotes}` : ""}

IMPORTANT REMINDERS:
• Please arrive 10-15 minutes early
• Dress professionally and appropriately
• Bring copies of your resume and any supporting documents
• Be prepared to discuss your qualifications and experience

Please confirm your attendance by replying to this email. If you need to reschedule, please contact us at least 24 hours in advance.

We look forward to meeting you and discussing your qualifications for this position.

Best regards,
HR Department
University of Baguio`,
  html: `<!doctype html>
<html lang="en-US">
<head>
  <meta content="text/html; charset=utf-8" http-equiv="Content-Type"/>
  <title>Interview Scheduled</title>
  <meta name="description" content="Interview Scheduled Email Template.">
  <style type="text/css">
    a:hover{text-decoration:underline!important}
    .interview-details {
      background-color: #f8f9fa;
      border-left: 4px solid #2f89ff;
      padding: 20px;
      margin: 20px 0;
      border-radius: 5px;
    }
    .detail-row {
      margin: 10px 0;
      display: flex;
      align-items: center;
    }
    .detail-label {
      font-weight: 600;
      color: #2f89ff;
      min-width: 100px;
      margin-right: 10px;
    }
    .detail-value {
      color: #455056;
      flex: 1;
    }
    .notes-section {
      background-color: #fff3cd;
      border: 1px solid #ffeeba;
      border-radius: 5px;
      padding: 15px;
      margin: 15px 0;
    }
    .notes-title {
      font-weight: 600;
      color: #856404;
      margin-bottom: 10px;
    }
  </style>
</head>
<body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0">
  <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8" style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
    <tr>
      <td>
        <table style="background-color: #f2f3f8; max-width:670px; margin:0 auto;" width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
          <tr><td style="height:80px;">&nbsp;</td></tr>
          <tr>
            <td>
              <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0" style="max-width:670px;background:#fff; border-radius:3px; text-align:left;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                <tr><td style="height:40px;">&nbsp;</td></tr>
                <tr>
                  <td style="padding:0 35px;">
                    <h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:28px;font-family:'Rubik',sans-serif; margin-bottom: 10px;">🎉 Interview Scheduled!</h1>
                    <p style="color:#455056; font-size:16px;line-height:24px; margin:20px 0;">
                      Dear <strong>${applicantName}</strong>,
                    </p>
                    <p style="color:#455056; font-size:16px;line-height:24px; margin:15px 0;">
                      Congratulations! Your application for the <strong>${position}</strong> scholarship has been reviewed and we would like to invite you for an interview.
                    </p>
                    
                    <div class="interview-details">
                      <h3 style="color:#2f89ff; margin:0 0 15px 0; font-size:18px;">📅 Interview Details</h3>
                      <div class="detail-row">
                        <span class="detail-label">📅 Date:</span>
                        <span class="detail-value"><strong>${interviewDate}</strong></span>
                      </div>
                      <div class="detail-row">
                        <span class="detail-label">🕐 Time:</span>
                        <span class="detail-value"><strong>${interviewTime}</strong></span>
                      </div>
                      <div class="detail-row">
                        <span class="detail-label">📍 Location:</span>
                        <span class="detail-value"><strong>${interviewLocation}</strong></span>
                      </div>
                    </div>

                    <div class="notes-section">
                      <div class="notes-title">🎒 What to Bring:</div>
                      <p style="color:#856404; margin:0; line-height:22px; white-space: pre-line;">${whatToBring}</p>
                    </div>

                    ${
                      interviewNotes
                        ? `
                    <div class="notes-section">
                      <div class="notes-title">💡 Important Notes:</div>
                      <p style="color:#856404; margin:0; line-height:22px;">${interviewNotes}</p>
                    </div>
                    `
                        : ""
                    }

                    <p style="color:#455056; font-size:16px;line-height:24px; margin:20px 0;">
                      <strong>Next Steps:</strong><br>
                      • Please confirm your attendance by replying to this email<br>
                      • If you need to reschedule, please contact us as soon as possible<br>
                      • Arrive a few minutes early to allow time for check-in
                    </p>

                    <p style="color:#455056; font-size:16px;line-height:24px; margin:20px 0;">
                      We look forward to meeting you and discussing your qualifications for this scholarship. Good luck!
                    </p>

                    <p style="color:#455056; font-size:16px;line-height:24px; margin:20px 0;">
                      Best regards,<br>
                      <strong>HR Department</strong>
                    </p>
                  </td>
                </tr>
                <tr><td style="height:40px;">&nbsp;</td></tr>
              </table>
            </td>
          </tr>
          <tr><td style="height:20px;">&nbsp;</td></tr>
          <tr>
            <td style="text-align:center;">
              <p style="font-size:14px; color:rgba(69, 80, 86, 0.7411764705882353); line-height:18px; margin:0 0 0;">&copy; Student Application Management System</p>
            </td>
          </tr>
          <tr><td style="height:80px;">&nbsp;</td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
});

// Interview result email template with encouraging/supportive messaging
export const getInterviewResultEmailTemplate = (
  applicantName: string,
  position: string,
  passed: boolean,
  comments?: string
) => ({
  subject: `Interview Update - ${position} Scholarship`,
  text: `Dear ${applicantName},

Thank you for taking the time to interview for the ${position} scholarship with us.

${
  passed
    ? `We are pleased to inform you that you have successfully passed the interview stage! Your qualifications and interview performance were impressive.

Next Steps:
Your application will now proceed to the next stage of our hiring process. You will be contacted soon with further details about completing the required hours as specified in your application.

${comments ? `Additional Comments: ${comments}` : ""}`
    : `After careful consideration, we have decided to move forward with other candidates for this particular position.

We want to emphasize that this decision does not reflect on your qualifications or potential. We were impressed by your enthusiasm and encourage you to apply for future opportunities with us.

${comments ? `Feedback: ${comments}` : ""}`
}

Thank you again for your interest in joining our team.

Best regards,
HR Department`,
  html: `<!doctype html>
<html lang="en-US">
<head>
  <meta content="text/html; charset=utf-8" http-equiv="Content-Type"/>
  <title>Interview ${passed ? "Success" : "Update"}</title>
  <meta name="description" content="Interview Result Email Template.">
  <style type="text/css">
    a:hover{text-decoration:underline!important}
    .result-banner {
      padding: 25px;
      margin: 20px 0;
      border-radius: 8px;
      text-align: center;
    }
    .success-banner {
      background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
      border: 2px solid #28a745;
    }
    .info-banner {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border: 2px solid #6c757d;
    }
    .next-steps {
      background-color: #e3f2fd;
      border-left: 4px solid #2196f3;
      padding: 20px;
      margin: 20px 0;
      border-radius: 5px;
    }
    .comments-section {
      background-color: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 5px;
      padding: 15px;
      margin: 15px 0;
    }
    .icon {
      font-size: 48px;
      margin-bottom: 15px;
    }
  </style>
</head>
<body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0">
  <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8" style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
    <tr>
      <td>
        <table style="background-color: #f2f3f8; max-width:670px; margin:0 auto;" width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
          <tr><td style="height:80px;">&nbsp;</td></tr>
          <tr>
            <td>
              <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0" style="max-width:670px;background:#fff; border-radius:3px; text-align:left;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                <tr><td style="height:40px;">&nbsp;</td></tr>
                <tr>
                  <td style="padding:0 35px;">
                    <h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:28px;font-family:'Rubik',sans-serif; margin-bottom: 10px;">Interview Update</h1>
                    
                    <p style="color:#455056; font-size:16px;line-height:24px; margin:20px 0;">
                      Dear <strong>${applicantName}</strong>,
                    </p>
                    
                    <p style="color:#455056; font-size:16px;line-height:24px; margin:15px 0;">
                      Thank you for taking the time to interview for the <strong>${position}</strong> scholarship with us.
                    </p>

                    <div class="result-banner ${passed ? "success-banner" : "info-banner"}">
                      <div class="icon">${passed ? "🎉" : "💭"}</div>
                      <h2 style="margin:0; color:${passed ? "#155724" : "#495057"}; font-size:24px;">
                        ${passed ? "Congratulations!" : "Thank You for Your Interest"}
                      </h2>
                      <p style="margin:15px 0 0 0; color:${passed ? "#155724" : "#495057"}; font-size:18px; font-weight:500;">
                        ${
                          passed
                            ? "You have successfully passed the interview stage!"
                            : "We have completed our evaluation process."
                        }
                      </p>
                    </div>

                    ${
                      passed
                        ? `
                    <div class="next-steps">
                      <h3 style="color:#1976d2; margin:0 0 15px 0; font-size:18px;">🎯 Next Steps</h3>
                      <p style="color:#455056; margin:10px 0; line-height:22px;">
                        Your application will now proceed to the next stage of our hiring process. You will need to complete the required hours as specified in your application form before final hiring.
                      </p>
                      <p style="color:#455056; margin:10px 0; line-height:22px;">
                        Our HR team will contact you soon with detailed information about the next steps and timeline.
                      </p>
                    </div>
                    `
                        : `
                    <p style="color:#455056; font-size:16px;line-height:24px; margin:20px 0;">
                      After careful consideration, we have decided to move forward with other candidates for this particular scholarship.
                    </p>
                    <p style="color:#455056; font-size:16px;line-height:24px; margin:15px 0;">
                      <strong>Please know that this decision does not reflect on your qualifications or potential.</strong> We were impressed by your enthusiasm and encourage you to apply for future scholarship opportunities with us.
                    </p>
                    <p style="color:#455056; font-size:16px;line-height:24px; margin:15px 0;">
                      We will keep your information on file and notify you of suitable scholarships that match your profile.
                    </p>
                    `
                    }

                    ${
                      comments
                        ? `
                    <div class="comments-section">
                      <h4 style="color:#495057; margin:0 0 10px 0;">${passed ? "💬 Additional Comments:" : "📝 Feedback:"}</h4>
                      <p style="color:#495057; margin:0; line-height:22px; font-style:italic;">"${comments}"</p>
                    </div>
                    `
                        : ""
                    }

                    <p style="color:#455056; font-size:16px;line-height:24px; margin:25px 0 20px 0;">
                      Thank you again for your interest in joining our team. We wish you the very best in your ${passed ? "upcoming role with us" : "future endeavors"}.
                    </p>

                    <p style="color:#455056; font-size:16px;line-height:24px; margin:20px 0;">
                      Best regards,<br>
                      <strong>HR Department</strong>
                    </p>
                  </td>
                </tr>
                <tr><td style="height:40px;">&nbsp;</td></tr>
              </table>
            </td>
          </tr>
          <tr><td style="height:20px;">&nbsp;</td></tr>
          <tr>
            <td style="text-align:center;">
              <p style="font-size:14px; color:rgba(69, 80, 86, 0.7411764705882353); line-height:18px; margin:0 0 0;">&copy; Student Application Management System</p>
            </td>
          </tr>
          <tr><td style="height:80px;">&nbsp;</td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
});

// Generic application status email template
export const getApplicationStatusEmailTemplate = (
  applicantName: string,
  position: string,
  status: string,
  customMessage?: string
) => {
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "submitted":
        return {
          icon: "📝",
          title: "Application Received",
          message:
            "Your application has been successfully submitted and is under review.",
          color: "#007bff",
        };
      case "under_review":
        return {
          icon: "👀",
          title: "Application Under Review",
          message: "Your application is currently being reviewed by our team.",
          color: "#ffc107",
        };
      case "interview_scheduled":
        return {
          icon: "📅",
          title: "Interview Scheduled",
          message: "An interview has been scheduled for your application.",
          color: "#28a745",
        };
      case "passed_interview":
        return {
          icon: "✅",
          title: "Interview Passed",
          message:
            "Congratulations! You have successfully passed the interview stage.",
          color: "#28a745",
        };
      case "hours_completed":
        return {
          icon: "⏰",
          title: "Required Hours Completed",
          message:
            "You have successfully completed the required hours. Your application is being processed for final hiring.",
          color: "#17a2b8",
        };
      case "accepted":
        return {
          icon: "🎉",
          title: "Congratulations - Application Accepted!",
          message:
            "Welcome to our team! Your application has been accepted for this scholarship.",
          color: "#28a745",
        };
      case "failed_interview":
        return {
          icon: "💭",
          title: "Interview Update",
          message:
            "Thank you for your time. After careful consideration, we have decided to move forward with other candidates.",
          color: "#6c757d",
        };
      case "rejected":
        return {
          icon: "📋",
          title: "Application Update",
          message:
            "Thank you for your interest. We have decided to move forward with other candidates for this scholarship.",
          color: "#6c757d",
        };
      default:
        return {
          icon: "📢",
          title: "Application Status Update",
          message: "There has been an update to your application status.",
          color: "#007bff",
        };
    }
  };

  const statusInfo = getStatusInfo(status);

  return {
    subject: `Application Update - ${position} Scholarship`,
    text: `Dear ${applicantName},

${statusInfo.title}

${customMessage || statusInfo.message}

Scholarship: ${position}
Status: ${status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}

Thank you for your interest in joining our team.

Best regards,
HR Department`,
    html: `<!doctype html>
<html lang="en-US">
<head>
  <meta content="text/html; charset=utf-8" http-equiv="Content-Type"/>
  <title>Application Status Update</title>
  <meta name="description" content="Application Status Email Template.">
  <style type="text/css">
    a:hover{text-decoration:underline!important}
    .status-banner {
      background: linear-gradient(135deg, ${statusInfo.color}15 0%, ${statusInfo.color}25 100%);
      border: 2px solid ${statusInfo.color};
      padding: 25px;
      margin: 20px 0;
      border-radius: 8px;
      text-align: center;
    }
    .status-details {
      background-color: #f8f9fa;
      border-left: 4px solid ${statusInfo.color};
      padding: 20px;
      margin: 20px 0;
      border-radius: 5px;
    }
    .icon {
      font-size: 48px;
      margin-bottom: 15px;
    }
  </style>
</head>
<body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0">
  <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8" style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
    <tr>
      <td>
        <table style="background-color: #f2f3f8; max-width:670px; margin:0 auto;" width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
          <tr><td style="height:80px;">&nbsp;</td></tr>
          <tr>
            <td>
              <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0" style="max-width:670px;background:#fff; border-radius:3px; text-align:left;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                <tr><td style="height:40px;">&nbsp;</td></tr>
                <tr>
                  <td style="padding:0 35px;">
                    <h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:28px;font-family:'Rubik',sans-serif; margin-bottom: 10px;">Application Status Update</h1>
                    
                    <p style="color:#455056; font-size:16px;line-height:24px; margin:20px 0;">
                      Dear <strong>${applicantName}</strong>,
                    </p>

                    <div class="status-banner">
                      <div class="icon">${statusInfo.icon}</div>
                      <h2 style="margin:0; color:${statusInfo.color}; font-size:24px;">${statusInfo.title}</h2>
                      <p style="margin:15px 0 0 0; color:#495057; font-size:16px;">
                        ${customMessage || statusInfo.message}
                      </p>
                    </div>

                    <div class="status-details">
                      <h3 style="color:${statusInfo.color}; margin:0 0 15px 0; font-size:18px;">📋 Application Details</h3>
                      <p style="color:#455056; margin:5px 0; line-height:22px;">
                        <strong>Scholarship:</strong> ${position}
                      </p>
                      <p style="color:#455056; margin:5px 0; line-height:22px;">
                        <strong>Current Status:</strong> ${status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      </p>
                    </div>

                    <p style="color:#455056; font-size:16px;line-height:24px; margin:25px 0 20px 0;">
                      Thank you for your continued interest in joining our team. We appreciate your patience throughout this process.
                    </p>

                    <p style="color:#455056; font-size:16px;line-height:24px; margin:20px 0;">
                      Best regards,<br>
                      <strong>HR Department</strong>
                    </p>
                  </td>
                </tr>
                <tr><td style="height:40px;">&nbsp;</td></tr>
              </table>
            </td>
          </tr>
          <tr><td style="height:20px;">&nbsp;</td></tr>
          <tr>
            <td style="text-align:center;">
              <p style="font-size:14px; color:rgba(69, 80, 86, 0.7411764705882353); line-height:18px; margin:0 0 0;">&copy; Student Application Management System</p>
            </td>
          </tr>
          <tr><td style="height:80px;">&nbsp;</td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  };
};

// Deployment interview scheduled email template
export const getDeploymentInterviewEmailTemplate = (
  applicantName: string,
  officeName: string,
  interviewDate: string,
  interviewTime: string,
  interviewLocation?: string,
  whatToBring?: string
) => ({
  subject: `Deployment Interview Scheduled - ${officeName}`,
  text: `Dear ${applicantName},

Your deployment interview with ${officeName} has been scheduled!

Interview Details:
Date: ${interviewDate}
Time: ${interviewTime}
Location: ${interviewLocation || "To be confirmed"}
Mode: In-Person

${whatToBring ? `What to Bring:\n${whatToBring}\n` : ""}
Please arrive 10 minutes early and be prepared to discuss your qualifications and experience.

If you have any questions or need to reschedule, please contact our office.

Best regards,
${officeName}`,
  html: `<!doctype html>
<html lang="en-US">
<head>
  <meta content="text/html; charset=utf-8" http-equiv="Content-Type"/>
  <title>Deployment Interview Scheduled</title>
  <meta name="description" content="Deployment Interview Scheduled Email Template.">
  <style type="text/css">
    a:hover{text-decoration:underline!important}
    .interview-details {
      background-color: #fff3cd;
      border: 2px solid #ffc107;
      padding: 25px;
      margin: 20px 0;
      border-radius: 8px;
    }
    .detail-row {
      margin: 12px 0;
      padding: 10px;
      background: #fffbf0;
      border-radius: 5px;
    }
    .icon {
      font-size: 48px;
      margin-bottom: 15px;
    }
  </style>
</head>
<body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0">
  <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8" style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
    <tr>
      <td>
        <table style="background-color: #f2f3f8; max-width:670px; margin:0 auto;" width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
          <tr><td style="height:80px;">&nbsp;</td></tr>
          <tr>
            <td>
              <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0" style="max-width:670px;background:#fff; border-radius:3px; text-align:left;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                <tr><td style="height:40px;">&nbsp;</td></tr>
                <tr>
                  <td style="padding:0 35px;">
                    <div style="text-align:center;">
                      <div class="icon">📅</div>
                      <h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:28px;font-family:'Rubik',sans-serif; margin-bottom: 10px;">Deployment Interview Scheduled!</h1>
                    </div>
                    
                    <p style="color:#455056; font-size:16px;line-height:24px; margin:20px 0;">
                      Dear <strong>${applicantName}</strong>,
                    </p>

                    <p style="color:#455056; font-size:16px;line-height:24px; margin:20px 0;">
                      Your deployment interview with <strong>${officeName}</strong> has been scheduled!
                    </p>

                    <div class="interview-details">
                      <h3 style="color:#f59e0b; margin:0 0 15px 0; font-size:18px;">📋 Interview Details</h3>
                      
                      <div class="detail-row">
                        <p style="color:#455056; margin:5px 0; line-height:22px;">
                          <strong>📅 Date:</strong> ${interviewDate}
                        </p>
                      </div>
                      
                      <div class="detail-row">
                        <p style="color:#455056; margin:5px 0; line-height:22px;">
                          <strong>🕐 Time:</strong> ${interviewTime}
                        </p>
                      </div>
                      
                      ${
                        interviewLocation
                          ? `
                      <div class="detail-row">
                        <p style="color:#455056; margin:5px 0; line-height:22px;">
                          <strong>📍 Location:</strong> ${interviewLocation}
                        </p>
                      </div>
                      `
                          : ""
                      }
                      
                      <div class="detail-row">
                        <p style="color:#455056; margin:5px 0; line-height:22px;">
                          <strong>👥 Mode:</strong> In-Person
                        </p>
                      </div>
                    </div>

                    ${
                      whatToBring
                        ? `
                    <div style="background-color: #e3f2fd; border-left: 4px solid #2196f3; padding: 20px; margin: 20px 0; border-radius: 5px;">
                      <h3 style="color:#2196f3; margin:0 0 10px 0; font-size:16px;">🎒 What to Bring</h3>
                      <p style="color:#455056; margin:0; line-height:22px; white-space: pre-line;">
                        ${whatToBring}
                      </p>
                    </div>
                    `
                        : ""
                    }

                    <p style="color:#455056; font-size:16px;line-height:24px; margin:25px 0 20px 0;">
                      Please arrive <strong>10 minutes early</strong> and be prepared to discuss your qualifications and experience.
                    </p>

                    <p style="color:#455056; font-size:14px;line-height:22px; margin:20px 0;">
                      If you have any questions or need to reschedule, please contact our office.
                    </p>

                    <p style="color:#455056; font-size:16px;line-height:24px; margin:20px 0;">
                      Best regards,<br>
                      <strong>${officeName}</strong>
                    </p>
                  </td>
                </tr>
                <tr><td style="height:40px;">&nbsp;</td></tr>
              </table>
            </td>
          </tr>
          <tr><td style="height:20px;">&nbsp;</td></tr>
          <tr>
            <td style="text-align:center;">
              <p style="font-size:14px; color:rgba(69, 80, 86, 0.7411764705882353); line-height:18px; margin:0 0 0;">&copy; Student Application Management System</p>
            </td>
          </tr>
          <tr><td style="height:80px;">&nbsp;</td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
});


export const getNewApplicationNotificationEmailTemplate = (
  applicantName: string,
  position: string,
  applicationId: string
) => {
  const positionTitle =
    position === "student_assistant" ? "Student Assistant" : "Student Marshal";

  return {
    subject: `🆕 New Application Received - ${applicantName}`,
    text: `New Application Notification

Hello,

A new application has been submitted to the Student Application Management System.

Applicant: ${applicantName}
Position: ${positionTitle}
Application ID: ${applicationId}

Please review this application in the Application Management section of the system.

Action Required:
• Review the application details
• Check the submitted documents and requirements
• Schedule psychometric test or interview as needed
• Update the application status accordingly

Log in to the system to review and process this application.

Best regards,
Student Application Management System
University of Baguio`,
    html: `<!doctype html>
<html lang="en-US">
<head>
  <meta content="text/html; charset=utf-8" http-equiv="Content-Type"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Application Received</title>
  <style type="text/css">
    body { margin: 0; padding: 0; }
    a:hover{text-decoration:underline!important}
  </style>
</head>
<body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0">
  <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8" style="font-family: 'Open Sans', sans-serif;">
    <tr>
      <td>
        <table style="background-color: #f2f3f8; max-width:670px; margin:0 auto;" width="100%" border="0" align="center" cellpadding="0" cellspacing="0">
          <tr><td style="height:80px;">&nbsp;</td></tr>
          <tr>
            <td>
              <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0" style="max-width:670px;background:#fff; border-radius:3px; text-align:center;box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                <tr><td style="height:40px;">&nbsp;</td></tr>
                <tr>
                  <td style="padding:0 35px;">
                    <h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:28px;font-family:'Rubik',sans-serif;">🆕 New Application Received</h1>
                    <span style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
                    
                    <div style="background-color: #e3f2fd; border-left: 4px solid #2196f3; padding: 20px; margin: 20px 0; border-radius: 5px; text-align: left;">
                      <p style="margin: 10px 0;"><strong style="color:#333;">Applicant:</strong> <span style="color:#666;">${applicantName}</span></p>
                      <p style="margin: 10px 0;"><strong style="color:#333;">Position:</strong> <span style="color:#666;">${positionTitle}</span></p>
                      <p style="margin: 10px 0;"><strong style="color:#333;">Application ID:</strong> <span style="color:#666; font-family: monospace;">${applicationId}</span></p>
                    </div>

                    <p style="color:#455056; font-size:15px;line-height:24px; margin:20px 0; text-align: left;">
                      A new application has been submitted to the Student Application Management System. Please review and process this application promptly.
                    </p>

                    <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: left;">
                      <h3 style="color:#333; margin: 0 0 15px 0; font-size: 16px;">Action Required:</h3>
                      <p style="margin: 8px 0; color:#666; font-size: 14px;">✓ Review the application details</p>
                      <p style="margin: 8px 0; color:#666; font-size: 14px;">✓ Check submitted documents and requirements</p>
                      <p style="margin: 8px 0; color:#666; font-size: 14px;">✓ Schedule psychometric test or interview</p>
                      <p style="margin: 8px 0; color:#666; font-size: 14px;">✓ Update application status accordingly</p>
                    </div>

                    <p style="color:#455056; font-size:14px;line-height:22px; margin:20px 0; text-align: center;">
                      Log in to the Application Management System to review and process this application.
                    </p>
                  </td>
                </tr>
                <tr><td style="height:40px;">&nbsp;</td></tr>
              </table>
            </td>
          </tr>
          <tr><td style="height:20px;">&nbsp;</td></tr>
          <tr>
            <td style="text-align:center;">
              <p style="font-size:14px; color:rgba(69, 80, 86, 0.74); line-height:18px; margin:0;">
                &copy; Student Application Management System - University of Baguio
              </p>
            </td>
          </tr>
          <tr><td style="height:80px;">&nbsp;</td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  };
};
