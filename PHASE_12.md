# Phase 12 — Inventory Management System

## Delivered

Phase 12 adds a real inventory layer to Shahnawaz Enterprises:

- Inventory item master for materials, products, components and supplies
- SKU, category, unit, store location, supplier and cost tracking
- On-hand, reserved and available quantities
- Reorder levels and low-stock detection
- Manual stock receipts and stock-out adjustments
- Inventory transaction history / audit trail
- Optional product-to-inventory mapping
- Automatic stock reservation when an order moves to Confirmed
- Automatic consumption when an order moves to In Production
- Automatic release when a confirmed order is cancelled
- Automatic restoration when a production-stage order is cancelled
- Admin inventory dashboard with KPIs and filters
- Admin CRUD and stock adjustment interface

## Important operational note

The application does not invent company stock quantities. Inventory records start empty until an administrator enters verified stock. Reorder levels, costs, suppliers and locations are configurable planning data.

## API

Admin-protected:

- GET `/api/inventory/summary`
- GET `/api/inventory/products`
- GET `/api/inventory`
- GET `/api/admin/inventory/transactions`
- GET `/api/admin/inventory/:id/transactions`
- POST `/api/admin/inventory`
- PUT `/api/admin/inventory/:id`
- PATCH `/api/admin/inventory/:id/adjust`
- DELETE `/api/admin/inventory/:id`

## Order integration

- `confirmed` → reserves mapped inventory
- `in_production` → consumes reserved inventory
- `cancelled` from `confirmed` → releases reservation
- `cancelled` from production/quality stages → restores consumed inventory

If an order item has no linked inventory record, it is not blocked by inventory because the company has not configured that product for stock tracking yet.
