# Production Deployment & Security Checklist

## Before pushing to Git
- [ ] Confirm `server/.env` and `client/.env` are ignored by Git.
- [ ] Check `git status --ignored` and `git ls-files` to ensure no secret files are tracked.
- [ ] If a secret was ever committed, rotate it; deleting it from the latest commit is not enough.
- [ ] Exclude `node_modules/`, `dist/`, logs, and local uploads.

## Backend hosting
- [ ] Set `NODE_ENV=production`.
- [ ] Set `MONGODB_URI`, `JWT_SECRET` (unique random 32+ chars), `CLIENT_URL` (exact HTTPS frontend origin).
- [ ] Set Cloudinary and Gemini credentials in the host's secret manager only if needed.
- [ ] Configure health check to `GET /api/ready`.
- [ ] Set `TRUST_PROXY=1` only when required by the hosting platform's proxy configuration.
- [ ] Restrict database user permissions and Atlas Network Access.
- [ ] Review `npm audit` findings before release.

## Frontend hosting
- [ ] Set `VITE_API_URL` to the deployed backend base URL ending in `/api`.
- [ ] Build from `client/` with `npm run build`.
- [ ] Test direct URL refreshes for `/products`, `/portfolio`, `/appointments`, and other React routes.
- [ ] Confirm browser requests to the API are allowed by the backend CORS allowlist.

## Acceptance tests
- [ ] `/api/health` returns HTTP 200 and `phase: 19`.
- [ ] `/api/ready` returns HTTP 200 when MongoDB is connected.
- [ ] `/api/ready` returns HTTP 503 if the database is unavailable.
- [ ] Login, registration and logout/token expiry behavior are checked.
- [ ] Non-admin users cannot access admin APIs.
- [ ] Product and portfolio images load from Cloudinary.
- [ ] Appointment, quotation, order, invoice, review and chatbot flows work.
- [ ] Production error responses do not expose stack traces or connection strings.
- [ ] MongoDB backup/restore approach is documented and tested.

## Before inviting real customers
- [ ] Replace demo records and placeholder content with approved business data.
- [ ] Publish privacy/contact/terms information and decide data retention practices.
- [ ] Confirm authorization, rate limits, backup/restore, and incident response.
- [ ] Do not claim compliance certification or complete production readiness without a suitable review.
