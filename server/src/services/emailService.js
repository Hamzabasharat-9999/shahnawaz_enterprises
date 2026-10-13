import nodemailer from 'nodemailer';

const company = 'Shahnawaz Enterprises';
const tagline = 'We Make Interiors';
const configured = () => Boolean(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS && (process.env.EMAIL_FROM || process.env.SMTP_USER));
let transporter;
function getTransporter() {
  if (!configured()) return null;
  if (!transporter) transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: String(process.env.SMTP_SECURE || '').toLowerCase() === 'true' || Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000
  });
  return transporter;
}
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function template({ heading, message, details = [] }) {
  const rows = details.filter(x => x && x.value !== undefined && x.value !== '').map(x => `<tr><td style="padding:9px 12px;color:#6b7280;border-bottom:1px solid #eee">${esc(x.label)}</td><td style="padding:9px 12px;color:#222;border-bottom:1px solid #eee;font-weight:600">${esc(x.value)}</td></tr>`).join('');
  return `<!doctype html><html><body style="margin:0;background:#f6f3f4;font-family:Arial,Helvetica,sans-serif;color:#242124"><div style="max-width:620px;margin:24px auto;background:#fff;border:1px solid #eadfe2;border-radius:14px;overflow:hidden"><div style="background:#741b35;padding:26px 30px;color:#fff"><div style="font-size:21px;font-weight:700">${company}</div><div style="margin-top:5px;color:#f4dfe6">${tagline}</div></div><div style="padding:28px 30px"><h1 style="font-size:22px;margin:0 0 14px;color:#741b35">${esc(heading)}</h1><p style="font-size:15px;line-height:1.7;margin:0 0 18px">${esc(message)}</p>${rows ? `<table style="width:100%;border-collapse:collapse;margin:18px 0">${rows}</table>` : ''}<p style="font-size:13px;color:#777;line-height:1.6;margin-top:26px">If you have questions, please contact our team using the contact details listed on our website.</p></div><div style="background:#faf7f8;padding:15px 30px;color:#8a7b80;font-size:12px">${company} · ${tagline}</div></div></body></html>`;
}
export async function sendEmail({ to, subject, heading, message, details }) {
  const transport = getTransporter();
  if (!transport || !to) return { sent: false, reason: !to ? 'recipient_missing' : 'smtp_not_configured' };
  try {
    await transport.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to,
      subject,
      text: [heading, message, ...(details || []).filter(x => x?.value).map(x => `${x.label}: ${x.value}`), `— ${company}`].join('\n\n'),
      html: template({ heading, message, details })
    });
    return { sent: true };
  } catch (error) {
    console.warn(`[email] Delivery failed (${subject}):`, error?.message || 'unknown error');
    return { sent: false, reason: 'delivery_failed' };
  }
}
export async function notifyCustomer({ to, name, subject, heading, message, details = [] }) {
  if (!to) return { sent: false, reason: 'recipient_missing' };
  return sendEmail({ to, subject, heading: name ? `Hello ${name}, ${heading}` : heading, message, details });
}
export async function notifyAdmin({ subject, heading, message, details = [] }) {
  const recipients = String(process.env.EMAIL_ADMIN_TO || '').split(',').map(x => x.trim()).filter(Boolean);
  if (!recipients.length) return { sent: false, reason: 'admin_recipient_missing' };
  return sendEmail({ to: recipients.join(', '), subject, heading, message, details });
}
export function emailStatus() { return { configured: configured(), provider: process.env.SMTP_HOST || null, adminRecipientConfigured: Boolean(process.env.EMAIL_ADMIN_TO) }; }
