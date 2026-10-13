# Phase 5 — Advanced Cost Estimation Calculator

Phase 5 adds a real preliminary estimation engine to the Phase 1–4 platform.

## Features
- Product-aware estimates using Phase 3 catalog data.
- Dimension, quantity, material and finish inputs.
- Material and finish rate cards.
- Waste, labour, overhead and contingency calculations.
- Single-item and project calculation API endpoints.
- Transparent cost breakdown.
- Direct continuation into the quotation workflow.
- Explicit preliminary-estimate disclaimer.

## Important pricing rule
The repository contains planning/default rates only. These are not verified Shahnawaz Enterprises prices. Replace `server/src/config/estimateConfig.js` with company-approved rates before production use.

## Formula
Material basis = starting product price OR material rate × measured area.

Direct cost = material + finish + waste.
Labour = direct cost × labour %.
Overhead = (direct cost + labour) × overhead %.
Subtotal = direct cost + labour + overhead.
Contingency = subtotal × contingency %.
Preliminary total = subtotal + contingency.

## API
GET `/api/estimates/config`
POST `/api/estimates/calculate`
POST `/api/estimates/calculate-project`
