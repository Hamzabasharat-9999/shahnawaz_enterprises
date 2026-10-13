# Phase 13 — Invoice Generation System

## Delivered
- Invoice model with immutable customer/project snapshots, line items, discounts, tax, shipping, totals, payment history and lifecycle status.
- Admin invoice generation from an existing order.
- Draft / issued / partially paid / paid / overdue / void states.
- Customer invoice list and invoice detail.
- Admin invoice desk with search, filters, invoice generation and payment recording.
- Printable invoice layouts using browser Print / Save as PDF, without requiring a server-side PDF dependency.
- Invoice visibility integrated into customer Order Detail and Account.

## APIs
### Customer
- GET `/api/invoices/mine`
- GET `/api/invoices/mine/:id`

### Admin
- GET `/api/admin/invoices`
- GET `/api/admin/invoices/:id`
- POST `/api/admin/invoices/from-order/:orderId`
- PATCH `/api/admin/invoices/:id`
- POST `/api/admin/invoices/:id/payments`

## Commercial rules
- One invoice per order.
- Invoice totals are recalculated from stored line items.
- Discount can be fixed or percentage.
- Tax rate and shipping are configurable per invoice.
- Payments cannot exceed the remaining balance.
- Void invoices cannot accept payments or be reopened.
- Invoice data stores snapshots so later customer/order edits do not silently rewrite historical billing records.

## PDF note
The invoice page is print-optimized. Users can choose **Save as PDF** from the browser print dialog. This keeps Phase 13 dependency-light and works on Windows without adding a PDF server package.

## Production note
Tax rates, payment terms, company legal/tax details, bank details and invoice branding must be replaced with verified Shahnawaz Enterprises information before production use.
