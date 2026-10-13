# Shahnawaz Enterprises API

Express + MongoDB backend for Phases 2–5.

## Run
```cmd
npm install
copy .env.example .env
npm run dev
```

## Phase 5 estimate endpoints
- `GET /api/estimates/config`
- `POST /api/estimates/calculate`
- `POST /api/estimates/calculate-project`

The estimate configuration contains planning defaults only. Replace them with verified company rates before production use.

### Phase 6 — Orders
- `POST /api/orders/from-quotation/:id`
- `GET /api/orders/mine`
- `GET /api/orders/mine/:id`
- `GET /api/admin/orders`
- `GET /api/admin/orders/:id`
- `PATCH /api/admin/orders/:id`
