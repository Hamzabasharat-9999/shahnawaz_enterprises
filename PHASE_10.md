# Phase 10 — Delivery & Location Management

## Delivered
- Delivery record automatically created when an approved quotation becomes an order.
- Customer delivery tracking page with status journey and destination details.
- Customer can update the delivery destination before dispatch.
- Google Maps link generated from stored coordinates or address.
- Admin Delivery Control desk with search, status/date filters, scheduling, time windows, recipient/location editing, assignment, vehicle, notes and dispatch updates.
- Delivery status transitions: pending → scheduled → assigned → out_for_delivery → delivered, with failed/cancelled exception paths.
- Delivery status synchronizes the related order when dispatched or delivered.
- Admin dashboard now links directly to Delivery Control.

## API
### Customer
- GET `/api/deliveries/config`
- GET `/api/deliveries/mine/:orderId`
- PATCH `/api/deliveries/mine/:orderId/address`
### Admin
- GET `/api/admin/deliveries`
- GET `/api/admin/deliveries/:id`
- POST `/api/admin/deliveries/from-order/:orderId`
- PATCH `/api/admin/deliveries/:id`
- DELETE `/api/admin/deliveries/:id`

## Routes
- `/account/orders/:orderId/delivery`
- `/admin/deliveries`

## Configuration note
Delivery time windows and supported city labels are planning defaults in `server/src/config/deliveryConfig.js`. Replace them with company-approved delivery areas and schedules before production use. No delivery location, phone number, vehicle, route, or company operating detail was invented.
