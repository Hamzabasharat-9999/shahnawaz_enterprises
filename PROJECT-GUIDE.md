# FYP Project Guide

## Project title

**Shahnawaz Enterprises: Furniture Discovery, Custom Quotation and Order Management Website**

## Problem statement

Customers looking for made-to-measure wooden furniture need to compare products, understand materials and dimensions, communicate a project brief, and follow the order after approval. A workshop also needs one place to manage products, quote requests, customer details, bookings, stock and order progress. This project prototypes that customer and admin journey in a single responsive website.

## Objectives

1. Present the business, services, example projects and contact routes professionally.
2. Help customers browse products, filter choices, read product information and reviews, and inspect product images.
3. Collect structured specifications for custom work and give an early cost estimate.
4. Let customers keep a demo account, delivery address, quotation, booking and order history.
5. Give administrators demo tools for products, inventory, quotations, bookings, users and order statuses.
6. Provide an understandable demonstration of product matching and FAQ assistance.

## Actors and main flows

**Visitor:** explore the collection → compare materials → estimate or request a consultation → register if an account action is required.

**Customer:** sign in → save delivery address → send a custom brief or place a product order → view quotation/order updates → access invoice and booking history → leave product feedback.

**Administrator:** sign in → review pending quotes → enter a quotation price → manage products and stock → update order progress and payment demo state → manage appointments and content.

## Feature mapping

| Area | Demonstration in the site |
|---|---|
| Business landing page | Company introduction, service overview, contact details and calls to action |
| Product catalog | Search, categories, product information, stock, pricing, reviews and photo zoom |
| Registration and login | Customer account form and sample admin login |
| Custom quotation | Item, dimensions, material, style, quantity and notes saved to account history |
| Cost estimation | Estimate based on dimensions, selected material, style and quantity |
| Order management | Customer order history and progress; admin status updates |
| Admin dashboard | Product, quote, order, inventory, user, booking and content pages |
| Work gallery | Project showcase with photographic imagery |
| Appointment booking | Consultation/site visit requests with available demo slots |
| Delivery information | Customer address book and delivery address on orders |
| Reviews | Product ratings and customer review form |
| Inventory | Raw material quantities and finished product stock |
| Invoice | Order invoice view with print/save as PDF |
| Product matching | Rules-based suggestions for budget, category, material and style |
| Help chat | FAQ-style responses and site navigation hints |

## Implementation overview

- **Interface:** HTML, CSS and vanilla JavaScript; responsive layout, hash-based navigation and reusable view templates.
- **Demo storage:** browser `localStorage` for sample users, products, quotes, orders, stock, bookings and reviews; `sessionStorage` for the active demo session.
- **Images and type:** remote Unsplash images and Google Fonts; internet access is needed for these assets.
- **Deployment:** GitHub Actions uploads the static files to GitHub Pages after the repository is configured to publish from Actions.

## FYP demonstration script

1. Show the landing page, material guide, custom-work process and FAQ.
2. Open the catalog; search and filter products. Click or right-click a product photo to zoom.
3. Open the estimator, change dimensions/material/quantity and calculate a planning estimate.
4. Register a customer account, submit a quote and book a consultation.
5. Log out and sign in with the sample admin account. Price a quote, update order progress, adjust stock and confirm an appointment.
6. Return to the customer account to explain quotation and order history, address management and invoice access.

Admin demo credentials: `admin@example.com` / `admin123`.

## Limitations and next iteration

This project demonstrates the workflows in one browser; it is not a production commerce backend. Browser-local storage is not secure or shared across users/devices. Password hashing in the demo does not replace server-side authentication. Orders and payments are simulated, notifications are not sent, and users can alter browser-stored data. Estimator prices, products, stock, reviews, projects, phone number and email are sample records. The recommender uses simple scoring and the chat uses predefined FAQ responses; neither calls an AI service.

A production iteration should add a documented API and relational database, server-side authentication and role checks, validated uploads, privacy controls, an audit trail, real payment-provider integration, reliable inventory transactions, appointment notifications, backup and deployment monitoring. Any public gallery, price list and customer testimonial should be reviewed and approved by the business first.

