# Phase 22 — Visibility Fixes

This update fixes three requested contrast issues:

- Active desktop and mobile navigation items use `bg-neutral-900 text-white`.
- The hero “Explore Services” button explicitly retains dark text on hover and has a visible keyboard focus outline.
- The “Have a project in mind?” CTA heading and emphasized line explicitly use `text-white`.

Files updated:
- `client/src/components/Navbar.jsx`
- `client/src/components/Hero.jsx`
- `client/src/components/CTA.jsx`

After extracting, run `npm ci` and `npm run build` inside `client` to verify the production build locally.
