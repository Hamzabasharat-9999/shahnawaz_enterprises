# Phase 7 — Admin Dashboard

Phase 7 adds a centralized administrator command center on top of Phases 1–6.

## Features
- Admin-only dashboard route: `/admin`
- Protected backend dashboard endpoint: `GET /api/admin/dashboard`
- KPI cards for orders, active orders, quotations, customers, products and completion
- Current order pipeline by status
- Six-month order-value trend
- Recent orders feed
- Recent quotations feed
- Direct shortcuts to Order Control, Quotation Desk and Product Catalog
- Refresh control and graceful loading/error states
- Admin dashboard link from the account page

## Dashboard API
`GET /api/admin/dashboard`

Requires a valid JWT for a user with `role: admin`.

Response includes:
- `kpis`
- `revenueByCurrency`
- `ordersByStatus`
- `quotationsByStatus`
- `productsByStatus`
- `pipeline`
- `trend`
- `recentOrders`
- `recentQuotations`

## Notes
Revenue is calculated from non-cancelled orders and grouped by currency. The current UI highlights PKR because the project is configured around PKR. No external analytics service is required.
