# Phase 20 — Automated Regression Tests & Continuous Integration

## Objective
Create a repeatable verification step for the verified Phase 19 baseline without changing the existing customer/admin workflows, MongoDB schema, Cloudinary media storage, authentication behavior, or company content.

## Included
- Built-in Node.js test runner (`node:test`), so no additional test framework dependency is required.
- API smoke/regression tests for:
  - `/api/health` phase and no-store response.
  - `/api/ready` response contract with MongoDB connected or unavailable.
  - `/api/company` public profile identity and metadata.
  - Helmet security headers and hidden Express signature.
  - allowed local CORS origin and denied untrusted origin.
  - controlled 404 response.
  - malformed JSON response.
- GitHub Actions workflow that installs dependencies with `npm ci`, runs backend tests, and builds the frontend on pushes, pull requests, and manual dispatch.
- Health and readiness endpoints now report phase 20.

## Run locally on Windows
Open a terminal:

```cmd
cd /d E:\SNEPHASES\SNE4\server
npm ci
npm test
```

Expected: eight tests pass. The readiness test intentionally accepts HTTP 200 when MongoDB is connected and HTTP 503 when it is not; it checks that the response status and JSON body agree.

Then build the frontend:

```cmd
cd /d E:\SNEPHASES\SNE4\client
npm ci
npm run build
```

Use `npm ci` when a valid `package-lock.json` is present and you want a clean, lockfile-based install. If you intentionally edit dependencies, update the lockfile with `npm install` and review the diff.

## API verification
- `GET /api/health` should return HTTP 200, `ok: true`, `phase: 20`.
- `GET /api/ready` should return HTTP 200 with `database: "connected"` when MongoDB is connected, otherwise HTTP 503 with `database: "unavailable"`.
- `GET /api/company` should continue to return the centralized company profile.

## GitHub Actions setup
1. Create or use a private GitHub repository.
2. Confirm `.env` files, tokens, API secrets, and production data are not committed.
3. Push this source tree. GitHub Actions runs the regression tests and frontend production build automatically.
4. Open the repository's **Actions** tab and review the latest workflow run.

The workflow does not require production secrets because the test suite uses an ephemeral local HTTP server and does not need to connect to MongoDB, Cloudinary, or Gemini.

## Scope and limitations
These are API smoke/regression tests, not a complete end-to-end test of every business flow. They do not replace manual testing of customer/admin login, product editing, appointment creation, quotations, orders, invoices, reviews, inventory, chatbot provider behavior, or Cloudinary uploads. Those workflows should be checked after any major changes and before deployment.

No database seed, data migration, or Cloudinary deletion is required for Phase 20.
