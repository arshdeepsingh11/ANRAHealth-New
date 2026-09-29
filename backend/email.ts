// Outgoing email (SMTP via nodemailer) — works with Microsoft 365, Google
// Workspace, Zoho, Amazon SES or any SMTP provider. Configure in .env:
//   SMTP_HOST, SMTP_PORT (587 or 465), SMTP_USER, SMTP_PASS, MAIL_FROM
// Development without SMTP: the email is printed to the server console so
// sign-up can still be tested. Production without SMTP: sending fails loudly.

import nodemailer, { type Transporter } from "nodemailer";

let transport: Transporter | null = null;

export const emailConfigured = () => !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

function getTransport(): Transporter {
  if (!transport) {
    const port = Number(process.env.SMTP_PORT || 587);
    transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465, // 587 uses STARTTLS
      requireTLS: port !== 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      pool: true,
      maxConnections: 3,
    });
  }
  return transport;
}

export async function sendMail(msg: { to: string; subject: string; text: string; html: string }) {
  if (!emailConfigured()) {
    if (process.env.NODE_ENV === "production") throw new Error("Email is not configured (SMTP_HOST / SMTP_USER / SMTP_PASS).");
    console.log(`\n[DEV EMAIL — SMTP not configured]\nTo: ${msg.to}\nSubject: ${msg.subject}\n\n${msg.text}\n`);
    return;
  }
  await getTransport().sendMail({ from: process.env.MAIL_FROM || process.env.SMTP_USER, ...msg });
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

/** Branded 6-digit code email. */
export function codeEmail(firstName: string, code: string) {
  const text = `Hi ${firstName},\n\nYour ANRA Health verification code is: ${code}\n\nIt expires in 10 minutes. If you didn't create a My Health Space account, you can ignore this email.\n\nANRA Health · Calgary, Alberta`;
  const html = `<!doctype html><html><body style="margin:0;background:#F6F4F1;font-family:Arial,Helvetica,sans-serif;color:#1D2327">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#FFFDFB;border-radius:20px;border:1px solid #ECE8E2;padding:32px">
<tr><td style="font-size:12px;letter-spacing:2px;color:#5B6369;font-weight:bold">ANRA HEALTH</td></tr>
<tr><td style="font-size:22px;padding:6px 0 18px">Verify your email</td></tr>
<tr><td style="font-size:15px;line-height:1.6;color:#454C52">Hi ${esc(firstName)}, enter this code in My Health Space to confirm your email address.</td></tr>
<tr><td align="center" style="padding:24px 0"><div style="display:inline-block;font-size:34px;letter-spacing:10px;font-weight:bold;color:#2F5A66;background:#E8F2F4;border-radius:14px;padding:14px 22px">${code}</div></td></tr>
<tr><td style="font-size:13px;line-height:1.6;color:#5B6369">The code expires in 10 minutes. If you didn't create an account, you can ignore this email — nobody can use it without this code.</td></tr>
<tr><td style="font-size:12px;color:#737A80;padding-top:24px;border-top:1px solid #EFECE8;margin-top:24px">ANRA Health · Calgary, Alberta · Never share this code, even with ANRA staff.</td></tr>
</table></td></tr></table></body></html>`;
  return { subject: `${code} is your ANRA Health verification code`, text, html };
}
