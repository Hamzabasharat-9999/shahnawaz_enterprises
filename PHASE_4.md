# Phase 4 — Custom Order / Quotation System

Phase 4 builds on Phases 1–3 and adds a complete quotation workflow.

## Customer flow

1. Browse products.
2. Open a product.
3. Click Request a Quote.
4. Add project information.
5. Add one or more products.
6. Enter quantity, dimensions, material, finish and notes.
7. Submit the quotation request.
8. Track it from `/account/quotations`.
9. Open `/account/quotations/:id` for details.
10. Cancel while the request is still cancellable.

## Admin flow

1. Login as an admin.
2. Open `/admin/quotations`.
3. Search/filter requests.
4. Select a request.
5. Move it through statuses.
6. Add a final quoted total.
7. Add customer-facing notes.
8. Set a validity date.
9. Reject with a reason when appropriate.

## API

Customer:
- `POST /api/quotations`
- `GET /api/quotations/mine`
- `GET /api/quotations/mine/:id`
- `PATCH /api/quotations/mine/:id/cancel`

Admin:
- `GET /api/admin/quotations`
- `GET /api/admin/quotations/:id`
- `PATCH /api/admin/quotations/:id`

## Pricing rule

The system only calculates a preliminary subtotal from products whose Phase 3 `priceMode` is `starting`. Quote-only products contribute zero to the preliminary subtotal and are manually reviewed. This prevents the application from presenting invented company pricing as final pricing.

The final amount is controlled by an administrator through `quotedTotal`.
