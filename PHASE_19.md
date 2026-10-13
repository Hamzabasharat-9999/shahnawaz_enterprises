# Phase 19 — Production Readiness, Deployment & Security Hardening

## Objective
Harden the verified Phase 18 source for a controlled deployment while preserving existing business features, routes, authentication, company profile, MongoDB data model, and Cloudinary media flow.

## Changes in this phase
- Production startup validation requires `MONGODB_URI`, `JWT_SECRET`, and `CLIENT_URL`.
- Production JWT secret must be at least 32 characters and must not be a known placeholder.
- `CLIENT_URL` supports a comma-separated allowlist of exact frontend origins. Production public origins should use HTTPS.
- Helmet security headers remain enabled; Express `X-Powered-By` is disabled.
- API-wide rate limit: 300 requests per IP per 15 minutes. Authentication endpoints keep an additional 100-request limit per IP per 15 minutes. Existing upload limits remain in place.
- Request body limits: JSON 1 MB; URL-encoded body 100 KB and at most 100 parameters.
- Production error responses do not expose stack traces or provider/database internals.
- `GET /api/health` is a liveness endpoint and reports phase 19.
- `GET /api/ready` reports whether MongoDB is connected and returns HTTP 503 while it is not ready. Configure hosting health checks to use this endpoint.
- Graceful shutdown listens for `SIGTERM` and `SIGINT` and closes HTTP/MongoDB connections.
- Added a Vercel SPA fallback configuration in `client/vercel.json`.
- Added an optional Render service blueprint in `render.yaml`.
- Added production deployment and security checklist.

## Local Windows verification

1. Keep the verified Phase 18 directory as a backup and extract the Phase 19 ZIP into a separate directory.
2. Copy your existing `server/.env` into the new `server/` directory. Copy `client/.env` too if used locally. Never share or commit either file.
3. In `server/.env`, keep local development settings such as:
   - `NODE_ENV=development`
   - `CLIENT_URL=http://localhost:5173`
   - valid `MONGODB_URI` and `JWT_SECRET`
   - existing Cloudinary/Gemini values as required
4. In one terminal:

   ```cmd
   cd /d E:\SNE_Phase19\server
   npm install
   npm run dev
   ```

5. In another terminal:

   ```cmd
   cd /d E:\SNE_Phase19\client
   npm install
   npm run dev
   ```

6. Verify:
   - `http://localhost:5000/api/health` returns HTTP 200 with `ok: true` and `phase: 19`.
   - `http://localhost:5000/api/ready` returns HTTP 200 and `database: "connected"` when MongoDB is connected.
   - `http://localhost:5000/api/company` still returns the company profile.
   - Customer/admin login, product list, portfolio images, appointment booking, chatbot and admin media management still work.
   - `npm run build` succeeds inside `client/`.

## Deploying the frontend to Vercel

1. Push the source repository to a private Git repository if it contains project code. Confirm `.env` files and secrets are not tracked.
2. Create a Vercel project with **Root Directory** set to `client`.
3. Set the production environment variable `VITE_API_URL` to the deployed backend URL ending in `/api`, for example `https://YOUR-API-HOST.example/api`. Replace the example with the actual backend URL.
4. Deploy and confirm direct navigation to `/products`, `/portfolio`, `/appointments`, and other client routes loads the React app.
5. Copy the exact deployed frontend origin (scheme + hostname, without a path) into backend `CLIENT_URL`.

## Deploying the backend to Render

1. Use `render.yaml` as a blueprint, or create a Node web service with root directory `server`, build command `npm install`, start command `npm start`, and health-check path `/api/ready`.
2. Configure secrets through the host dashboard, never by committing `.env`.
3. Set `MONGODB_URI`, a unique random `JWT_SECRET` of 32+ characters, and `CLIENT_URL` to the exact deployed frontend origin. Multiple trusted frontend origins can be comma-separated.
4. Add Cloudinary credentials and the optional Gemini key if these features are enabled.
5. Use MongoDB Atlas Network Access rules that allow only the deployment's known outbound IPs where practical. Some hosting plans use changing outbound IPs; check the provider's current networking options rather than opening Atlas access more broadly than necessary.
6. After deployment, verify `/api/health`, `/api/ready`, and key authenticated workflows. Do not consider deployment complete until frontend CORS and admin access are tested.

## Security checklist

- [ ] `.env` and secret files are ignored by Git and absent from the repository history.
- [ ] Rotate any API key or database password that has ever been exposed or committed.
- [ ] Use HTTPS for the public frontend and backend.
- [ ] Use a unique, randomly generated production `JWT_SECRET`.
- [ ] `CLIENT_URL` contains only the exact trusted production frontend origin(s).
- [ ] MongoDB Atlas user follows least privilege; network access is restricted where practical.
- [ ] Cloudinary and Gemini keys exist only in backend environment settings.
- [ ] Create/verify the administrator account privately; never expose admin creation routes publicly.
- [ ] Test customer/admin authorization for every protected admin route.
- [ ] Run `npm audit` in `server` and `client`; review findings and update dependencies carefully rather than applying breaking updates blindly.
- [ ] Confirm backups and a recovery plan for MongoDB Atlas before real customer use.
- [ ] Configure log retention and avoid logging tokens, passwords, private customer information, or full request bodies.
- [ ] Replace demonstration products, example projects, default estimates and placeholder company details with company-approved content before public launch.
- [ ] Add privacy notice, terms, consent/retention decisions and contact details appropriate to the actual business and jurisdiction before collecting real customer information.

## Notes and limitations
- `GET /api/health` intentionally checks process liveness only. Use `/api/ready` for database readiness.
- `CLIENT_URL` is an exact origin allowlist, not a URL path. Example: `https://company.example`, not `https://company.example/some/path`.
- `TRUST_PROXY=1` should be enabled only when the service is behind the expected trusted proxy. Review your hosting provider's proxy setup.
- Rate limits are in-memory per process. Multi-instance production deployments should use a shared store if consistent cross-instance enforcement is required.
- This phase provides deployment configuration and hardening; it does not deploy the project or certify it as legally/commercially production-ready.
