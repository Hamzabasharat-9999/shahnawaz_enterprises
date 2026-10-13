# Phase 11 — Review & Feedback System

## Delivered

Phase 11 adds a verified customer review and feedback system connected to delivered/completed orders.

### Customer
- Public approved review wall at `/reviews`.
- Verified reviews are tied to a real order.
- Customers can submit a review only for delivered or completed orders.
- One review per order.
- Overall rating from 1–5.
- Review title and detailed experience.
- Optional category ratings: quality, service, communication, value.
- Recommendation flag.
- Pending/approved/rejected states.
- Customers can edit pending reviews.
- Account review history at `/account/reviews`.

### Admin
- Review moderation desk at `/admin/reviews`.
- Pending, approved and rejected queues.
- Search by order, project or review content.
- Approve, reject, keep pending and delete.
- Internal moderation note.
- Aggregate average rating and queue counts.

## API

Public:
- `GET /api/reviews`
- `GET /api/reviews/config`

Customer:
- `GET /api/reviews/mine`
- `POST /api/reviews`
- `PATCH /api/reviews/mine/:id`

Admin:
- `GET /api/admin/reviews`
- `GET /api/admin/reviews/:id`
- `PATCH /api/admin/reviews/:id`
- `DELETE /api/admin/reviews/:id`

## Trust rule

Only orders with status `delivered` or `completed` are eligible for reviews. This makes the public review badge a verified-project indicator rather than an anonymous testimonial.
