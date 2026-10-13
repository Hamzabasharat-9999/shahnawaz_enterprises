# Phase 17 — Real Company Data & Content

## What changed

- Added a central public company profile for the React frontend at `client/src/config/companyProfile.js`.
- Added a matching backend profile at `server/src/config/companyProfile.js` for the chatbot and public profile endpoint. Keep these two files aligned when company-approved details arrive.
- Refactored the home-page hero, About, Services, Solutions, Why Choose Us, Contact, Navbar, Footer and chatbot greeting to use company profile values where appropriate.
- Removed the non-functional contact form from the contact section. The UI no longer suggests that an enquiry was submitted when there is no submission endpoint.
- Social links and call/WhatsApp/email actions appear only when the corresponding official details have been filled in.
- Added `GET /api/company` to return the public profile and a completeness indicator.
- Updated the health endpoint phase label to 17.
- Replaced the destructive sample product seeder: it now inserts missing draft demonstration products only; existing records are left untouched and no products are deleted.
- Product and portfolio pages clearly distinguish the published/verified catalog from content awaiting confirmation.

## Verified company information

- Name: Shahnawaz Enterprises
- Tagline: We Make Interiors
- Services: Contracts; Interior Consultants; General Order Suppliers

Address, phone, WhatsApp, email, business hours, mission, vision, company history, social URLs, approved product list, prices, project names, project locations, achievements and certifications must be supplied/confirmed by the company. Do not invent them.

## Important: sample product records already in MongoDB

Phase 16 created four sample products using the earlier seed script. This phase intentionally changes the seed script to be safe and draft-only, but changing the source file does not automatically change records already stored in Atlas.

The seeder inserts a draft only when one of its four demonstration slugs does not already exist. Existing records—including any company-approved products—are left untouched. It does not delete or overwrite products:

```cmd
cd server
npm run seed
```

This is safe for unrelated products. Existing records are skipped, including records with matching slugs, so the script will not convert an already stored product to draft. Verify the catalog in Admin → Product Catalog after running it. Draft products will not appear in the public catalog until an admin edits and publishes verified content.

## Company profile editing

Edit the empty fields in both profile files:

- `client/src/config/companyProfile.js`
- `server/src/config/companyProfile.js`

Client profile fields include `contact`, `social`, `about.history`, `about.mission`, `about.vision`, and `solutionCategories`. Backend profile fields include the corresponding contact/social details plus `mission` and `vision`. Keep the two copies synchronized. The current setup is file-configured; an admin-editable settings panel is not part of Phase 17.

Never commit `.env` files or add database/API secrets to either profile.

## API

- `GET /api/company` — public company profile and completeness metadata.
- Existing product, portfolio, quotation, order and other APIs remain in place.

## Run and test

Backend:

```cmd
cd server
npm install
npm run dev
```

Frontend in a second terminal:

```cmd
cd client
npm install
npm run dev
```

Check `http://localhost:5000/api/company`, `http://localhost:5000/api/health`, `http://localhost:5173`, `/products`, `/portfolio` and `/chat`.

Build the frontend:

```cmd
cd client
npm run build
```

Check server syntax:

```cmd
cd server
node --check src/app.js
node --check src/services/chatbotService.js
node --check src/scripts/seedProducts.js
```

## Completion criteria

- Public profile endpoint returns JSON.
- Home page reads approved copy from the central profile.
- Missing contact/social details do not produce fake links or contact values.
- Contact section does not claim to submit a message before Phase 19 implements enquiries/notifications.
- Demo product seed is non-destructive: it inserts missing draft examples and never modifies or deletes existing products.
- Frontend production build and backend syntax checks pass.
- Real company details are added only after company confirmation.
