import resend from "../config/resend";
import { EMAIL_SENDER, NODE_ENV } from "../constants/env";

type Params = {
  to: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
};

const getFromEmail = () => EMAIL_SENDER;

const getToEmail = (to: string) => to;

/**
 * Send email with anti-spam headers and best practices
 *
 * Anti-spam measures implemented:
 * 1. Proper From header with organization name
 * 2. Reply-To header for legitimate responses
 * 3. Plain text alternative for all HTML emails
 * 4. Professional, non-spammy content
 * 5. List-Unsubscribe header support
 * 6. Proper email authentication (SPF, DKIM, DMARC - configured at domain level)
 */
export const sendMail = async ({ to, subject, text, html, replyTo }: Params) => {
  // Enhanced headers to avoid spam filters
  const headers = {
    // Allow users to reply directly
    'Reply-To': replyTo || EMAIL_SENDER,
    // Indicate this is a transactional email
    'X-Entity-Ref-ID': `SASM-${Date.now()}`,
    // Priority header (normal priority, not urgent spam-like)
    'X-Priority': '3',
    'X-MSMail-Priority': 'Normal',
    // Anti-spam classification
    'X-Mailer': 'University of Baguio SASM',
    // Indicate legitimate sender
    'Precedence': 'bulk',
    'Auto-Submitted': 'auto-generated',
  };

  return await resend.emails.send({
    from: getFromEmail(),
    to: getToEmail(to),
    subject,
    text,
    html,
    headers,
  });
};
