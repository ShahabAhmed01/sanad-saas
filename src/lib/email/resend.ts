import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail({
  to,
  subject,
  html,
  from = "Sanad <noreply@sanad.pk>",
}: SendEmailParams) {
  if (!resend) {
    console.log("Resend not configured — email skipped:", subject, "to", to);
    return { success: false, error: "Resend not configured" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from,
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error("Email send failed:", error);
    return { success: false, error: error.message };
  }
}

// Email templates
export function staffInvitationEmail(
  schoolName: string,
  staffName: string,
  role: string,
  tempPassword: string
) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'IBM Plex Sans', sans-serif; background: #F7F6F1; margin: 0; padding: 40px 20px; }
        .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; padding: 32px; border: 1px solid #E4E2D8; }
        .logo { display: flex; align-items: center; gap: 8px; margin-bottom: 24px; }
        .logo-icon { width: 32px; height: 32px; background: #B88602; color: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; }
        .logo-text { font-family: 'Fraunces', serif; font-size: 20px; font-weight: 600; color: #12332F; }
        h1 { font-family: 'Fraunces', serif; color: #12332F; font-size: 24px; margin: 0 0 16px; }
        p { color: #6B6B62; line-height: 1.6; margin: 0 0 16px; }
        .credentials { background: #F7F6F1; border-radius: 8px; padding: 16px; margin: 16px 0; }
        .credentials p { margin: 4px 0; font-size: 14px; }
        .credentials strong { color: #12332F; }
        .button { display: inline-block; background: #B88602; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 500; margin: 16px 0; }
        .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #E4E2D8; font-size: 12px; color: #9A9A91; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">
          <div class="logo-icon">S</div>
          <div class="logo-text">Sanad</div>
        </div>
        <h1>You've been invited to ${schoolName}</h1>
        <p>Hello ${staffName},</p>
        <p>You've been invited to join <strong>${schoolName}</strong> on Sanad as a <strong>${role}</strong>.</p>
        <div class="credentials">
          <p><strong>Email:</strong> (use the email this was sent to)</p>
          <p><strong>Temporary Password:</strong> ${tempPassword}</p>
        </div>
        <p>Please log in and change your password immediately.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://sanad.pk"}/login" class="button">Log in to Sanad</a>
        <div class="footer">
          <p>This invitation was sent by ${schoolName} via Sanad. If you didn't expect this, please ignore this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function feeReminderEmail(
  schoolName: string,
  studentName: string,
  amount: number,
  dueDate: string
) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'IBM Plex Sans', sans-serif; background: #F7F6F1; margin: 0; padding: 40px 20px; }
        .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; padding: 32px; border: 1px solid #E4E2D8; }
        .logo { display: flex; align-items: center; gap: 8px; margin-bottom: 24px; }
        .logo-icon { width: 32px; height: 32px; background: #B88602; color: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; }
        .logo-text { font-family: 'Fraunces', serif; font-size: 20px; font-weight: 600; color: #12332F; }
        h1 { font-family: 'Fraunces', serif; color: #12332F; font-size: 24px; margin: 0 0 16px; }
        p { color: #6B6B62; line-height: 1.6; margin: 0 0 16px; }
        .amount { font-size: 32px; font-weight: bold; color: #BD4545; text-align: center; margin: 24px 0; }
        .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #E4E2D8; font-size: 12px; color: #9A9A91; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">
          <div class="logo-icon">S</div>
          <div class="logo-text">Sanad</div>
        </div>
        <h1>Fee Reminder</h1>
        <p>This is a reminder that the following fee is due:</p>
        <div class="amount">PKR ${amount.toLocaleString()}</div>
        <p><strong>Student:</strong> ${studentName}</p>
        <p><strong>School:</strong> ${schoolName}</p>
        <p><strong>Due Date:</strong> ${dueDate}</p>
        <p>Please pay before the due date to avoid any interruptions.</p>
        <div class="footer">
          <p>This reminder was sent by ${schoolName} via Sanad.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function welcomeEmail(schoolName: string, adminName: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'IBM Plex Sans', sans-serif; background: #F7F6F1; margin: 0; padding: 40px 20px; }
        .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; padding: 32px; border: 1px solid #E4E2D8; }
        .logo { display: flex; align-items: center; gap: 8px; margin-bottom: 24px; }
        .logo-icon { width: 32px; height: 32px; background: #B88602; color: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; }
        .logo-text { font-family: 'Fraunces', serif; font-size: 20px; font-weight: 600; color: #12332F; }
        h1 { font-family: 'Fraunces', serif; color: #12332F; font-size: 24px; margin: 0 0 16px; }
        p { color: #6B6B62; line-height: 1.6; margin: 0 0 16px; }
        .button { display: inline-block; background: #B88602; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 500; margin: 16px 0; }
        .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #E4E2D8; font-size: 12px; color: #9A9A91; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">
          <div class="logo-icon">S</div>
          <div class="logo-text">Sanad</div>
        </div>
        <h1>Welcome to Sanad!</h1>
        <p>Hello ${adminName},</p>
        <p>Your school <strong>${schoolName}</strong> has been set up on Sanad. You have a <strong>21-day free trial</strong> with full access to all features.</p>
        <p>Here's what you can do next:</p>
        <ul style="color: #6B6B62; line-height: 1.8;">
          <li>Add your staff members</li>
          <li>Set up classes and sections</li>
          <li>Enroll students</li>
          <li>Configure fee structures</li>
        </ul>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://sanad.pk"}/dashboard" class="button">Go to Dashboard</a>
        <div class="footer">
          <p>Questions? Reply to this email or visit our help center.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
