const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM ?? "CloseTrack <hello@closetrack.co>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

interface EmailResult { success: boolean; error?: string }

async function sendEmail(to: string, subject: string, html: string): Promise<EmailResult> {
  if (!RESEND_API_KEY || RESEND_API_KEY.startsWith("re_your")) {
    console.log(`[Email stub] To: ${to} | Subject: ${subject}`);
    return { success: true };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: EMAIL_FROM, to, subject, html }),
  });

  if (!res.ok) {
    const body = await res.text();
    return { success: false, error: body };
  }
  return { success: true };
}

export async function sendPortalInvite(
  clientEmail: string,
  clientName: string,
  portalToken: string,
  agentName: string
): Promise<EmailResult> {
  const portalUrl = `${APP_URL}/portal/${portalToken}`;
  return sendEmail(
    clientEmail,
    `Your Transaction Portal is Ready — CloseTrack`,
    `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;">
      <h1 style="font-size:24px;font-weight:700;margin-bottom:8px;">Welcome, ${clientName}!</h1>
      <p style="color:#6b7280;margin-bottom:24px;">
        ${agentName} has set up a secure transaction portal for your home purchase.
        Track progress, view documents, and communicate directly from one place.
      </p>
      <a href="${portalUrl}" style="display:inline-block;background:#6366f1;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;">
        Open Your Portal
      </a>
      <p style="color:#9ca3af;font-size:12px;margin-top:32px;">
        This link is unique to you. Do not share it with others.<br/>
        © ${new Date().getFullYear()} CloseTrack Inc.
      </p>
    </div>
    `
  );
}

export async function sendTaskReminder(
  userEmail: string,
  taskTitle: string,
  dueDate: string,
  dealAddress: string
): Promise<EmailResult> {
  return sendEmail(
    userEmail,
    `Task Due: ${taskTitle} — CloseTrack`,
    `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;">
      <h2 style="font-size:20px;font-weight:700;color:#1f2937;">Task Reminder</h2>
      <div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:8px;padding:16px;margin:16px 0;">
        <strong>${taskTitle}</strong><br/>
        <span style="color:#92400e;">Due: ${dueDate}</span><br/>
        <span style="color:#6b7280;">${dealAddress}</span>
      </div>
      <a href="${APP_URL}/tasks" style="display:inline-block;background:#6366f1;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">
        View Tasks
      </a>
    </div>
    `
  );
}

export async function sendDealUpdate(
  userEmail: string,
  dealAddress: string,
  updateSummary: string
): Promise<EmailResult> {
  return sendEmail(
    userEmail,
    `Deal Update: ${dealAddress} — CloseTrack`,
    `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;">
      <h2 style="font-size:20px;font-weight:700;color:#1f2937;">Deal Update</h2>
      <p style="color:#374151;"><strong>${dealAddress}</strong></p>
      <p style="color:#6b7280;">${updateSummary}</p>
      <a href="${APP_URL}/deals" style="display:inline-block;background:#6366f1;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">
        View Deal
      </a>
    </div>
    `
  );
}

export async function sendWelcomeEmail(
  userEmail: string,
  userName: string
): Promise<EmailResult> {
  return sendEmail(
    userEmail,
    `Welcome to CloseTrack, ${userName}!`,
    `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;">
      <h1 style="font-size:28px;font-weight:700;margin-bottom:8px;">Welcome, ${userName}!</h1>
      <p style="color:#6b7280;margin-bottom:24px;">
        Your CloseTrack account is ready. Start managing your real estate transactions
        with AI-powered insights, client portals, and seamless document management.
      </p>
      <a href="${APP_URL}/dashboard" style="display:inline-block;background:#6366f1;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;">
        Go to Dashboard
      </a>
    </div>
    `
  );
}
