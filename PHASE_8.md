# Phase 8 — Portfolio / Work Gallery

## Delivered
- PortfolioProject MongoDB model
- Public portfolio listing/search/category filtering
- Public portfolio detail pages with project story, gallery, services and materials
- Admin Portfolio Manager with create/edit/archive/publish/draft/featured controls
- Real company project policy: no fake projects are presented as completed work
- Homepage portfolio preview now reads published featured projects from the API
- Admin account shortcut to Portfolio Manager

## API
- GET /api/portfolio
- GET /api/portfolio/:slug
- GET /api/admin/portfolio
- POST /api/admin/portfolio
- PUT /api/admin/portfolio/:id
- DELETE /api/admin/portfolio/:id

## Routes
- /portfolio
- /portfolio/:slug
- /admin/portfolio

## Image strategy
Phase 8 uses image URLs so the system stays dependency-free. Later, Cloudinary or another approved media service can replace this input without changing the portfolio workflow.
