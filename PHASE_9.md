# Phase 9 — Appointment Booking System

## Delivered
- Customer appointment booking flow
- Consultation type selection with duration
- Date availability and real-time slot calculation from MongoDB bookings
- Configurable working days, hours, break, booking horizon and slot duration
- Double-booking protection with slot-key conflict checks and a partial unique MongoDB index
- Customer appointment history and appointment detail pages
- Customer cancellation for pending/confirmed appointments
- Admin appointment desk with search, status/date filters and rescheduling
- Admin status controls: pending, confirmed, completed, cancelled, no-show, rejected
- Appointment notes, project context, contact mode and site address
- Account navigation integration
- Navbar consultation CTA

## Planning schedule
The initial appointment schedule is intentionally configurable and should not be presented as verified Shahnawaz Enterprises business hours until the company confirms it.

Current planning defaults:
- Timezone: Asia/Karachi
- Working days: Monday–Saturday
- Hours: 10:00–17:00
- Break: 13:00–14:00
- Slot size: 30 minutes
- Booking horizon: 45 days

Edit `server/src/config/appointmentConfig.js` when the company confirms the real schedule.

## Customer routes
- `/appointments`
- `/account/appointments`
- `/account/appointments/:id`

## Admin route
- `/admin/appointments`

## API
Public:
- `GET /api/appointments/config`
- `GET /api/appointments/availability?date=YYYY-MM-DD&type=initial_consultation`

Customer:
- `POST /api/appointments`
- `GET /api/appointments/mine`
- `GET /api/appointments/mine/:id`
- `PATCH /api/appointments/mine/:id/cancel`

Admin:
- `GET /api/admin/appointments`
- `GET /api/admin/appointments/:id`
- `PATCH /api/admin/appointments/:id`

## Next enhancement
Phase 10 can connect delivery/location management to confirmed orders and appointments, followed later by notifications/email automation once the company's verified contact and mail settings are supplied.
