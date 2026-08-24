# Amane Store — Frosted Premium v2

This ZIP is a self-contained frontend prototype/rebuild direction for Amane Store.

## Included
- `index.html` — complete responsive storefront
- `MASTER_PROMPT.md` — reusable master prompt for future AI/code updates
- `README.md` — setup notes

## Included UX
- mobile-first responsive layout
- frosted glass navigation/drawers/modals
- minimal premium fashion visual system
- category discovery
- search
- filters
- sorting
- product cards
- wishlist using localStorage
- product detail modal
- size selection
- cart drawer
- quantity controls
- checkout form
- COD / UPI / Card visual choices
- order confirmation
- newsletter interaction
- scroll reveal
- reduced-motion support
- accessible labels for icon controls
- responsive 2/3/4-column product grid

## Important production notes
This is a frontend prototype. Payment gateways, real authentication, real inventory, real orders, shipping APIs, email/SMS and Supabase security rules must be connected before production use.

The product images in this prototype are CSS-generated placeholders so the ZIP remains self-contained. Replace them with real optimized product photography (WebP/AVIF + responsive sizes) before launch.

For your existing Amane Store repo, preserve your working Supabase schema/credentials and migrate the visual system rather than blindly replacing backend logic.
