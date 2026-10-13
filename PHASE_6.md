# Phase 6 — Order Management System

Phase 6 connects the quotation workflow to a real project-order lifecycle.

## Customer flow

1. Admin issues a quotation with status `quoted` and a final amount.
2. Customer opens the quotation and selects **Approve & create order**.
3. The backend creates one order from that quotation and marks the quotation `approved`.
4. Customer can open **My orders** and track the project.

## Order statuses

- `pending_confirmation`
- `confirmed`
- `in_production`
- `quality_check`
- `ready_for_delivery`
- `out_for_delivery`
- `delivered`
- `completed`
- `cancelled`

The backend enforces forward workflow transitions instead of allowing arbitrary status jumps.

## Admin features

- Search by order number, customer, email or project.
- Filter by order status.
- Change status according to the workflow.
- Add a timeline note for every status change.
- Set estimated delivery date.
- Add delivery notes and company notes.
- Automatically record delivered/completed timestamps.

## API

Customer:
- `POST /api/orders/from-quotation/:id`
- `GET /api/orders/mine`
- `GET /api/orders/mine/:id`

Admin:
- `GET /api/admin/orders`
- `GET /api/admin/orders/:id`
- `PATCH /api/admin/orders/:id`

## Important behavior

The order stores a snapshot of quotation items and customer/project information. This protects the order record from later product/catalog changes.

Phase 6 uses the quotation's final approved amount. The system does not process payments yet; payment/invoice functionality belongs to later phases.
