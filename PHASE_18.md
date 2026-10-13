# Phase 18 — Professional Image Management

## Objective
Add secure Cloudinary-backed image uploads for product and portfolio administration while preserving the existing Phase 17 data shape and application routes.

## Included
- Server-side Cloudinary configuration via environment variables.
- Admin-only `POST /api/admin/media` multipart endpoint.
- Admin-only `GET /api/admin/media/status` endpoint.
- JPEG, PNG, WebP and AVIF allowlist.
- 8 MB per-file limit; maximum 8 files per upload; upload rate limit.
- Uploads stored under `CLOUDINARY_FOLDER/products`, `/portfolio`, or `/company`.
- Image records retain `url`, `alt`, `publicId`, `width`, `height`, and `format`.
- Product and portfolio admin editors now support upload, thumbnail previews, alt text editing, and removing gallery references.
- Local placeholder for missing/failed images.
- Health endpoint updated to phase 18.
- README includes setup and test instructions.

## Setup on Windows
1. Keep the verified Phase 17 folder as a backup and extract this archive to a new folder.
2. Copy your existing `server/.env` into the new `server/` folder. Keep it private.
3. Add Cloudinary values to `server/.env`:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `CLOUDINARY_FOLDER=shahnawaz-enterprises`
4. Never add Cloudinary credentials to `client/.env` or any `VITE_` variable.
5. In `server/`, run `npm install`, then `npm run dev`.
6. In `client/`, run `npm install`, then `npm run dev`.
7. Verify `/api/health` reports phase 18, and sign in as admin to upload a test image under Admin Products and Admin Portfolio.

## Safety
- Upload API requires `protect` and `requireAdmin`.
- File types and sizes are validated server-side.
- Images are kept in memory only for upload; the app does not save uploaded binary files to the project directory.
- Removing a gallery image reference does not delete the Cloudinary asset. This avoids deleting assets that may be reused elsewhere; unused media can be cleaned up in Cloudinary's console after checking references.
- Existing external image URLs remain supported.
- No MongoDB migration or seeding is required.

## Validation
Backend JavaScript syntax is checked with `node --check`. The frontend production build should be run in the user's verified Windows environment after `npm install`, because this archive's provided dependency tree is not bundled and the validation environment cannot use the Windows Rollup native optional dependency.
