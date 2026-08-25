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

## Store operations

- **Products:** Open `admin.html`, sign in with an allow-listed admin account, then add, edit, stock-toggle, or remove products. New records in Supabase's `products` table are automatically shown in the storefront.
- **Customer journey:** `customerlogin.html` provides email/password registration, sign-in, password-reset email, and Google OAuth. `account.html` shows customer orders, saved items, and reviews; the storefront automatically links the account icon to the correct page for the active session.
- **Orders and wishlists:** Checkout associates an order with the signed-in customer when one exists. Wishlist selections stay usable locally for guests and synchronize to Supabase when a customer is signed in.

### Required Supabase configuration

1. In **Authentication → Providers**, enable Email and Google, and add your Google OAuth client ID/secret.
2. In **Authentication → URL Configuration**, add your deployed origin (for example `https://your-domain.com`) as a redirect URL. The Google sign-in button returns shoppers to `index.html`.
3. Ensure `orders.customer_id` and `wishlist.customer_id` reference `auth.users.id`, and add a unique constraint for `wishlist(customer_id, product_id)` so wishlist upserts work.
4. Add row-level security policies: customers may read/write only rows where `customer_id = auth.uid()`; admins need their own protected policies. Never expose a Supabase service-role key in these HTML files.

The visual storefront includes CSS 3D hero objects, depth animation, and intersection-observer reveal transitions. Reduced-motion settings disable those animations.
