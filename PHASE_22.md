# Phase 22 — UI/UX Refinement (Part A: Navigation, Footer & Floating Assistant)

## Implemented in this package

### 1. Navigation bar
- Removed **AI Assistant** from the primary navigation list.
- Replaced the thin active underline with a rounded, high-contrast active-page pill.
- Added active states for nested routes (for example, product detail pages).
- Refined spacing, borders, focus visibility, and desktop/mobile behavior.
- Kept the account entry and quotation CTA available without crowding the main navigation.

### 2. Floating AI assistant
- Added a fixed bottom-right chat widget across the main site.
- Reuses the existing `/api/chatbot/chat` backend route and current authentication context.
- Includes suggested questions, loading state, error fallback, response links, and a link to the full `/chat` page.
- Hides the floating widget while the full `/chat` page is open.
- Does not require a new API key or backend change.

### 3. Corporate footer
- Rebuilt the footer into four responsive areas: company branding, navigation, services, and showroom/contact.
- Added visible social icon slots for Facebook, Instagram, Pinterest, and WhatsApp.
- Social icons become clickable only when an official URL/number is configured.
- WhatsApp accepts a configured URL or a phone number in `companyProfile.js`.
- Contact address, email, phone, hours and map link are read from the existing company profile; unconfirmed company information has not been invented.
- Added a consultation CTA, legal copyright line, and back-to-top interaction.

## Files changed
- `client/src/components/Navbar.jsx`
- `client/src/components/Footer.jsx`
- `client/src/components/FloatingChatWidget.jsx` (new)
- `client/src/layouts/MainLayout.jsx`
- `client/src/utils/constants.js`
- `client/src/config/companyProfile.js`

## Configure official footer links

Edit `client/src/config/companyProfile.js` and fill only company-approved values:

- `contact.address`
- `contact.phone`
- `contact.whatsapp`
- `contact.email`
- `contact.businessHours`
- `contact.mapUrl`
- `social.facebook`
- `social.instagram`
- `social.pinterest`
- `social.whatsapp`

Do not add guessed phone numbers, social handles, opening hours or addresses. WhatsApp can use a full `https://wa.me/...` URL or a company-approved phone number.

## Local verification

From the `client` folder:

```powershell
npm ci
npm run build
```

From the `server` folder:

```powershell
npm ci
npm test
```

Then start the backend and frontend using the project's existing scripts and verify desktop and mobile layouts.

## Scope note

This is the first slice of Phase 22, focused on Navbar, Footer, and moving the AI assistant into a floating widget as requested. The remaining planned UI/UX pass includes the hero CTA hover contrast and replacing academic `MODULE X` labels on internal pages with customer-facing headings. Those are not marked complete in this package.
