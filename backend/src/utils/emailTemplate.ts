export const getPasswordResetTemplate = (url: string) => ({
  subject: "Password Reset Request",
  text: `You requested a password reset. Click on the link to reset your password: ${url}`,
  html: `<!doctype html><html lang="en-US"><head><meta content="text/html; charset=utf-8" http-equiv="Content-Type"/><title>Reset Password Email Template</title><meta name="description" content="Reset Password Email Template."><style type="text/css">a:hover{text-decoration:underline!important}</style></head><body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0"><!--100%body table--><table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8" style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;"><tr><td><table style="background-color: #f2f3f8; max-width:670px;  margin:0 auto;" width="100%" border="0" align="center" cellpadding="0" cellspacing="0"><tr><td style="height:80px;">&nbsp;</td></tr><tr><td style="text-align:center;"></a></td></tr><tr><td style="height:20px;">&nbsp;</td></tr><tr><td><table width="95%" border="0" align="center" cellpadding="0" cellspacing="0" style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);"><tr><td style="height:40px;">&nbsp;</td></tr><tr><td style="padding:0 35px;"><h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">You have requested to reset your password</h1><span style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span><p style="color:#455056; font-size:15px;line-height:24px; margin:0;">A unique link to reset your password has been generated for you. To reset your password, click the following link and follow the instructions.</p><a target="_blank" href="${url}" style="background:#2f89ff;text-decoration:none !important; font-weight:500; margin-top:24px; color:#fff;text-transform:uppercase; font-size:14px;padding:10px 24px;display:inline-block;border-radius:50px;">Reset Password</a></td></tr><tr><td style="height:40px;">&nbsp;</td></tr></table></td><tr><td style="height:20px;">&nbsp;</td></tr><tr><td style="text-align:center;"><p style="font-size:14px; color:rgba(69, 80, 86, 0.7411764705882353); line-height:18px; margin:0 0 0;">&copy;</p></td></tr><tr><td style="height:80px;">&nbsp;</td></tr></table></td></tr></table><!--/100%body table--></body></html>`,
});

export const getVerifyEmailTemplate = (url: string) => ({
  subject: "Verify Email Address",
  text: `Click on the link to verify your email address: ${url}`,
  html: `<!doctype html><html lang="en-US"><head><meta content="text/html; charset=utf-8" http-equiv="Content-Type"/><title>Verify Email Address Email Template</title><meta name="description" content="Verify Email Address Email Template."><style type="text/css">a:hover{text-decoration:underline!important}</style></head><body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0"><!--100%body table--><table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8" style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;"><tr><td><table style="background-color: #f2f3f8; max-width:670px;  margin:0 auto;" width="100%" border="0" align="center" cellpadding="0" cellspacing="0"><tr><td style="height:80px;">&nbsp;</td></tr><tr><td style="text-align:center;"></a></td></tr><tr><td style="height:20px;">&nbsp;</td></tr><tr><td><table width="95%" border="0" align="center" cellpadding="0" cellspacing="0" style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);"><tr><td style="height:40px;">&nbsp;</td></tr><tr><td style="padding:0 35px;"><h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">Please verify your email address</h1><span style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span><p style="color:#455056; font-size:15px;line-height:24px; margin:0;">Click on the following link to verify your email address.</p><a target="_blank" href="${url}" style="background:#2f89ff;text-decoration:none !important; font-weight:500; margin-top:24px; color:#fff;text-transform:uppercase; font-size:14px;padding:10px 24px;display:inline-block;border-radius:50px;">Verify Email Address</a></td></tr><tr><td style="height:40px;">&nbsp;</td></tr></table></td><tr><td style="height:20px;">&nbsp;</td></tr><tr><td style="text-align:center;"><p style="font-size:14px; color:rgba(69, 80, 86, 0.7411764705882353); line-height:18px; margin:0 0 0;">&copy;</p></td></tr><tr><td style="height:80px;">&nbsp;</td></tr></table></td></tr></table><!--/100%body table--></body></html>`,
});

// Interview scheduled email template with complete details
export const getInterviewScheduledEmailTemplate = (
  applicantName: string,
  position: string,
  interviewDate: string,
  interviewTime: string,
  interviewLocation: string,
  interviewNotes?: string
) => ({
  subject: `Interview Scheduled - ${position} Position`,
  text: `Dear ${applicantName},

Congratulations! Your application for the ${position} position has been reviewed and we would like to invite you for an interview.

Interview Details:
Date: ${interviewDate}
Time: ${interviewTime}
Location: ${interviewLocation}

${interviewNotes ? `Additional Notes: ${interviewNotes}` : ""}

Please confirm your attendance by replying to this email. If you need to reschedule, please contact us as soon as possible.

We look forward to meeting you and discussing your qualifications for this position.

Best regards,
HR Department`,
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
                      Congratulations! Your application for the <strong>${position}</strong> position has been reviewed and we would like to invite you for an interview.
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
                      We look forward to meeting you and discussing your qualifications for this position. Good luck!
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
  subject: `Interview Update - ${position} Position`,
  text: `Dear ${applicantName},

Thank you for taking the time to interview for the ${position} position with us.

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
                      Thank you for taking the time to interview for the <strong>${position}</strong> position with us.
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
                      After careful consideration, we have decided to move forward with other candidates for this particular position.
                    </p>
                    <p style="color:#455056; font-size:16px;line-height:24px; margin:15px 0;">
                      <strong>Please know that this decision does not reflect on your qualifications or potential.</strong> We were impressed by your enthusiasm and encourage you to apply for future opportunities with us.
                    </p>
                    <p style="color:#455056; font-size:16px;line-height:24px; margin:15px 0;">
                      We will keep your information on file and notify you of suitable positions that match your profile.
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
      case "hired":
        return {
          icon: "🎉",
          title: "Congratulations - You're Hired!",
          message:
            "Welcome to our team! You have been successfully hired for this position.",
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
            "Thank you for your interest. We have decided to move forward with other candidates for this position.",
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
    subject: `Application Update - ${position} Position`,
    text: `Dear ${applicantName},

${statusInfo.title}

${customMessage || statusInfo.message}

Position: ${position}
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
                        <strong>Position:</strong> ${position}
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
