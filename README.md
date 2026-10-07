# Shahnawaz Enterprises — Furniture & Joinery

A responsive FYP prototype for a wood-furniture business. The site brings product discovery, custom quotation, cost estimation, customer accounts, appointment requests and an admin demo into one browser-based experience.

## Run the project

Open `index.html` in a modern browser. No package installation or build step is needed. Product and lifestyle photos and the font family load online.

## Demo access

- Admin email: `admin@example.com`
- Admin password: `admin123`
- Customer accounts can be registered from the Sign in page.
- The demo stores its data in that browser's `localStorage`; clearing the browser's site data resets the demo.

## Feature tour

- Responsive home page, service overview, project gallery, wood guide and FAQ
- Product catalog with category/search, product information, stock, reviews and image zoom on click or right-click
- Customer registration, sign-in, delivery addresses, quote history, bookings and order progress
- Custom order brief and a material, size, style and quantity estimator
- Product recommendation matching, scripted help chat, printable invoices and appointment requests
- Admin dashboard for products, quotations, orders, raw-material inventory, users, bookings and site content
- GitHub Pages deployment workflow in `.github/workflows/pages.yml`

## Before presenting or publishing

The business name is set to Shahnawaz Enterprises. Replace the placeholder phone/email, sample product prices, stock, reviews and project gallery with information approved by the business. All sample records are demonstration content and should not be presented as verified sales or customer history. Images come from Unsplash and require an internet connection.

This is a front-end academic prototype. The browser demo uses local storage, so accounts and orders are not shared across devices. The estimator is indicative; the recommender is rules-based; the chat uses preset answers. There is no real authentication server, payment processing, email/SMS notification or AI service. See `PROJECT-GUIDE.md` for the system overview, feature mapping and live-system recommendations.

## Publish using GitHub Pages

1. Put these site files and the `.github` folder in the repository root.
2. In the GitHub repository, open **Settings → Pages** and set the publishing source to **GitHub Actions**.
3. Push to the `main` branch. The included workflow uploads the static site and publishes it. GitHub displays the resulting URL under the `github-pages` deployment environment.

