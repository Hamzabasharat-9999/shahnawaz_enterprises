# Phase 21 — Email Notifications

## What changed
- Added a reusable, branded HTML/text email service using Nodemailer and SMTP environment variables.
- Customer notifications: registration welcome, quotation received/status changes, appointment received/status changes, order created/status changes, invoice issued, payment recorded, and delivery status changes.
- Admin alerts: new registrations, quotation requests, appointment requests, and orders when `EMAIL_ADMIN_TO` is configured.
- Notifications are best-effort and never block a saved business transaction. If SMTP is not configured, notifications are skipped safely.
- Added `GET /api/email/status` to report whether SMTP and admin recipients are configured; it never reveals credentials.
- Updated health/readiness phase identifiers to 21.

## Configure SMTP (Gmail example)
1. Open `server/.env` (create it by copying `server/.env.example`).
2. Set `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=587`, `SMTP_SECURE=false`.
3. Set `SMTP_USER` to the sending Gmail address.
4. Set `SMTP_PASS` to a Google App Password (not your normal Google password). App Passwords require Google 2-Step Verification and may not be available for every account.
5. Set `EMAIL_FROM` to the sender address, normally the same as `SMTP_USER`.
6. Set `EMAIL_ADMIN_TO` to the admin inbox; multiple recipients can be comma-separated.
7. Restart the backend. Keep `server/.env` private and never put SMTP secrets in `client/.env`.

## Install and run
```powershell
cd E:\SNEPHASES\SNE4\server
npm install
npm test
npm run dev
```
Use the actual extracted Phase 21 folder name if different.

## Verify
- Open `http://localhost:5000/api/email/status`; expect `email.configured: true` after valid SMTP variables are set. This endpoint only checks configuration, not whether an email can be delivered.
- Register a test customer using a mailbox you control. Check inbox and spam/junk.
- Submit a test quotation and appointment, then change their status from the admin interface.
- Create an order from a quoted quotation; test invoice issue/payment and delivery status if those flows are part of your demo.
- Check backend logs for `[email] Delivery failed` if SMTP rejects a message. A failed email does not undo the saved action.

## Notes and limitations
- SMTP is intentionally disabled until the required environment variables are present.
- Use a dedicated project sender mailbox and app password. Never commit real `.env` values.
- This phase does not implement a durable retry queue or email delivery tracking/webhooks.
- Run the existing backend tests and frontend production build locally before treating the phase as verified.
