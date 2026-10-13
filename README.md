# Shahnawaz Enterprises — FYP Platform

A React + Express + MongoDB platform for interior business discovery and workflow management. The project contains the modules built through Phase 20.

## Modules included

1. Business landing page
2. Registration and login
3. Product catalog
4. Custom quotation requests
5. Preliminary cost estimator
6. Order management
7. Admin dashboard
8. Portfolio / work gallery
9. Appointment booking
10. Delivery and location management
11. Reviews and feedback
12. Inventory management
13. Invoice generation and payment tracking
14. Explainable product recommendations
15. AI chatbot / business assistant
16. Local environment and database configuration
17. Company profile and content readiness
18. Professional image management (Cloudinary)
19. Production readiness, deployment and security hardening
20. Automated API regression tests and continuous integration

## Requirements

- Node.js compatible with Vite 7 and the current backend packages (Node.js 22 LTS or a verified compatible release is recommended)
- npm
- MongoDB Atlas or a local MongoDB instance
- Optional Gemini API key for AI-powered chatbot responses

## Configure and run the backend

```cmd
cd server
npm install
copy .env.example .env
```

Edit `server/.env` and set at least `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL=http://localhost:5173`, and `PORT=5000`. Keep `.env` private and out of version control.

Create an admin using the existing script:

```cmd
npm run create-admin -- "Admin Name" admin@example.com StrongPassword
```

Start the API:

```cmd
npm run dev
```

## Configure and run the frontend

In a second terminal:

```cmd
cd client
npm install
copy .env.example .env
npm run dev
```

Set `VITE_API_URL=http://localhost:5000/api` in `client/.env`.

- Frontend: `http://localhost:5173`
- API health: `http://localhost:5000/api/health`
- Public company profile: `http://localhost:5000/api/company`
- Admin dashboard: `http://localhost:5173/admin`

## Company content configuration

- Frontend: `client/src/config/companyProfile.js`
- Backend/chatbot: `server/src/config/companyProfile.js`
- Company information checklist: `COMPANY_CONTENT_CHECKLIST.md`

Keep the two profile files aligned. Only add real contact details, official statements, prices, certifications, project details and approved photos after company confirmation. The logo and social links are intentionally blank until supplied.

## Demonstration products

The seeder is intentionally non-destructive and prepares four **draft** examples only. It no longer deletes unrelated products. To add any missing draft examples (existing records with the same slugs are left untouched):

```cmd
cd server
npm run seed
```

The script will set those four named examples to draft. Do not run it if those exact products are genuine company-approved products you have already published. Review `PHASE_17.md` before running it on a database containing real catalog entries.

## Cost-estimation disclaimer

Calculator rates are planning defaults, not verified Shahnawaz Enterprises rates. Use only company-approved rate data for customer-facing commercial estimates.

## Phase documentation

- `PHASE_17.md` — company profile/content changes and testing steps
- `COMPANY_CONTENT_CHECKLIST.md` — information to collect from the company representative
- `PHASE_13.md` — invoice generation
- `PHASE_14.md` — AI recommendations
- `PHASE_15.md` — AI chatbot

## Security notes

- Never commit `.env` files or expose MongoDB/JWT/Gemini secrets.
- Configure Atlas Network Access narrowly.
- Do not publish unverified contact information, private client details, unlicensed images or unsupported company claims.
- Complete the dedicated security-hardening and deployment phases before using this as a production service.


## Phase 18 — Professional Image Management

Product and portfolio administrators can upload images to Cloudinary directly from their management forms. Uploaded files are stored in Cloudinary; MongoDB stores secure image URLs and optional asset metadata (`publicId`, dimensions and format). Public pages continue to consume the same `images[]` URL structure, so existing image URLs remain compatible.

### Configure Cloudinary

1. Create a Cloudinary account and open its Dashboard.
2. Copy the Cloud Name, API Key and API Secret.
3. Add the following values to `server/.env` (never put the API secret in a `VITE_` variable or client-side file):

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_FOLDER=shahnawaz-enterprises
```

4. In the server folder, run `npm install` to install the Phase 18 dependencies, then restart with `npm run dev`.
5. Sign in with an administrator account, open Admin Products or Admin Portfolio, and use **Upload images**.

Upload restrictions: JPEG, PNG, WebP and AVIF; up to 8 MB per image and 8 images per upload. Uploading is protected by existing JWT authentication, admin-role authorization and a rate limit. Cloudinary credentials remain server-side. Removing an image from a product/project gallery only removes its reference from that record; it does not delete the remote Cloudinary asset, preventing accidental deletion of reused media.

If Cloudinary is not configured, existing image URLs still display normally, but new Cloudinary uploads return a clear configuration error. Public product and portfolio pages use a local placeholder when an image is absent or fails to load.

### Phase 18 endpoints

- `GET /api/admin/media/status` — administrator-only configuration status.
- `POST /api/admin/media` — administrator-only multipart upload. Use `images` for file fields and `folder` as `products`, `portfolio`, or `company`.
- `GET /api/health` now reports `phase: 18`.

### Dependencies / lockfile note

Phase 18 adds `cloudinary` and `multer` to `server/package.json`. Run `npm install` in `server/` so npm resolves these packages and updates the lockfile for your environment. Do not use `npm ci` until that updated lockfile has been generated.


## Phase 19 — production readiness

Phase 19 adds production environment validation, an exact CORS origin allowlist, API and authentication rate limits, request-size limits, safer production error responses, graceful shutdown, and a database readiness endpoint.

- `GET /api/health` is a liveness check and reports `phase: 19`.
- `GET /api/ready` is the deployment readiness check and returns HTTP 503 while MongoDB is disconnected.
- `server/src/config/environment.js` validates required production settings.
- `client/vercel.json` provides an SPA fallback for React Router routes.
- `render.yaml` is an optional Render backend blueprint.
- `PHASE_19.md` contains Windows verification and deployment steps.
- `SECURITY_DEPLOYMENT_CHECKLIST.md` lists pre-launch checks.

### Production environment requirements

On your hosting provider, configure:
- `NODE_ENV=production`
- `MONGODB_URI` — production MongoDB connection string
- `JWT_SECRET` — unique random secret of at least 32 characters
- `CLIENT_URL` — exact frontend origin such as `https://your-frontend.example` (no path or trailing slash; comma-separated if you operate multiple trusted frontends)
- `VITE_API_URL` in the frontend build environment — backend base URL ending in `/api`

Use HTTPS for public deployments. Set Cloudinary and Gemini secrets only in the backend hosting environment. Never commit `.env` files. Do not deploy until the Phase 19 security checklist has been reviewed.


## Phase 20 — Regression tests and CI

Run the backend API regression tests:

```cmd
cd server
npm ci
npm test
```

Build the frontend:

```cmd
cd client
npm ci
npm run build
```

`PHASE_20.md` documents the tests and GitHub Actions workflow. The automated suite covers health/readiness contracts, the company profile, security headers, CORS behavior, unknown routes and malformed JSON. It is a smoke/regression layer, not a replacement for testing all authenticated business workflows.


## Phase 21 — Email notifications
See [PHASE_21.md](./PHASE_21.md) for SMTP configuration, Gmail App Password setup, and end-to-end test steps. Outbound email is disabled safely until SMTP variables are configured.


## Phase 22 — UI/UX Refinement (Part A)

This build refines the primary navigation, adds a floating AI chat widget, and replaces the footer with a responsive multi-column corporate layout. See [`PHASE_22.md`](./PHASE_22.md) for the exact changes, company-profile configuration, and verification steps. The hero hover fix and removal of remaining academic module labels are still part of the next UI/UX pass.
