# Phase 14 — AI Product Recommendation System

## Delivered
- Explainable SmartMatch recommendation engine using live active Product catalog data.
- Inputs: project type, room/space, budget, budget flexibility, search intent, materials, finishes, styles and priorities.
- Ranked recommendations with score, rank and human-readable reasons.
- Public featured recommendation endpoint.
- Customer-facing `/recommendations` page with premium project-profile UI.
- Product and quotation CTAs from every recommendation.
- Customer Account shortcut to AI Recommendations.

## API
- `GET /api/recommendations/featured`
- `POST /api/recommendations`

## Engine behavior
The current engine is intentionally deterministic and explainable. It scores catalog text, category fit, tags, specifications, project type, preferences, budget proximity and featured status. It requires no third-party AI key, so the feature works offline from the company's catalog database.

## Important production note
Recommendations are decision support, not a substitute for professional measurement, material verification or final company quotation. Product data, tags, specifications and pricing should be kept accurate by the admin team.
