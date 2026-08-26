# Amane Store — Foundation Specification v1

**Status:** Draft for implementation lock
**Source basis:** Direct inspection of the supplied ZIP, prior Gemini roadmap PDF, and current official documentation for Supabase/Razorpay/Next.js.

## 0. Rules of this document

1. This document separates **observed current behavior** from **proposed target design**.
2. Anything marked **UNVERIFIED** must not be treated as working or secure until tested against the real Supabase project/deployment.
3. No large rewrite is allowed without updating this document first.
4. One bounded engineering task at a time; every task ends with validation.
5. Business-critical truth (price, stock, payment state, order state, authorization) must not depend on browser-only state.

## 1. Current-state baseline (observed in supplied ZIP)

The repository contains five files: `index.html`, `customerlogin.html`, `account.html`, `admin.html`, and `README.md`.

### Current architecture
- Plain HTML + inline CSS/JavaScript.
- Supabase JS loaded from CDN.
- Cart is persisted in `localStorage` (`amane-cart`).
- Wishlist uses `localStorage` and syncs records to Supabase for signed-in users.
- Product loading uses Supabase with a fallback product set.
- Checkout inserts an `orders` row directly from the browser.
- Product images in the admin flow are converted client-side to data URLs rather than uploaded to Supabase Storage.
- Admin access has an email allow-list plus a `sessionStorage` marker.
- Admin order list performs direct browser-side order updates/deletes.
- Account page reads orders, wishlist, and reviews.
- The storefront filter button is currently a UI placeholder that shows a toast instead of opening an actual filter system.

### Current-order write path
`index.html` currently constructs the cart total and order payload in the browser and inserts directly into `orders` with fields including customer, address, payment mode, item text, and total amount.

This is a prototype path, not an authoritative production checkout path.

### Current product model inferred from code
Observed product fields include:
- `id`
- `title`
- `category`
- `code`
- `price`
- `mrp`
- `discount`
- `color`
- `sizes`
- `images`
- `in_stock` / transformed `inStock`
- `delivery_text` / transformed `deliveryText`
- `return_text` / transformed `returnText`

### Current order model inferred from code
Observed order fields include:
- `id`
- `created_at`
- `status`
- `customer_id`
- `customer_name`
- `phone`
- `address`
- `city_state` / source input maps through `city`
- `pincode`
- `payment_mode`
- `items` (serialized human-readable text)
- `total_amount`

**UNVERIFIED:** the exact live Supabase schema, constraints, grants, RLS policies, triggers, functions, storage policies, and indexes are not contained in the supplied ZIP.

## 2. Non-negotiable target principles

### 2.1 Source of truth
- Browser state may provide UX state.
- Database/server must be authoritative for catalog, price, stock, order state, and payment state.
- The final payable amount is never accepted from the browser as authoritative input.

### 2.2 Authorization
- UI checks are not security boundaries.
- Customer authorization is enforced with Supabase Auth + Postgres grants + RLS.
- Admin authorization is enforced server/database-side, not by a hard-coded email list alone.
- Service-role credentials never ship to the browser.

Supabase's current security guidance explicitly treats grants and RLS as separate layers and recommends RLS for exposed tables; `service_role` bypasses RLS and must remain server-side. See official docs: https://supabase.com/docs/guides/database/postgres/row-level-security

### 2.3 Payment
Online payments will use a server-created payment order, server-side verification, and server-side webhooks. Browser success UI is not proof of payment.

Razorpay's current webhook guidance states that webhooks are server-to-server events and should be used for server-side payment state; duplicate events are expected and must be handled idempotently. See:
- https://razorpay.com/docs/webhooks/
- https://razorpay.com/docs/webhooks/validate-test/

### 2.4 Inventory
Stock must be validated and reserved atomically or through a transactionally safe database/server path. A client-side `in_stock` boolean is not an inventory system.

## 3. Target roles

| Role | Meaning | Core permissions |
|---|---|---|
| Anonymous | Not signed in | Public catalog/read-only content; local guest UX |
| Customer | Signed-in shopper | Own profile, cart, wishlist; own order read; permitted reviews |
| Admin | Store operator | Controlled product/inventory/order/review operations |
| Service | Server-only trusted execution | Payment verification, privileged transactional operations |

## 4. Target core data model

### `profiles`
- `id uuid primary key references auth.users(id)`
- customer profile fields
- timestamps

### `products`
- `id uuid primary key`
- `slug text unique`
- `title text`
- `description text`
- `category_id uuid`
- `status text` (draft/active/archived)
- `currency text`
- timestamps

### `product_variants`
- `id uuid primary key`
- `product_id uuid references products(id)`
- `sku text unique`
- `size text`
- `color text`
- `price numeric`
- `compare_at_price numeric`
- `status text`

### `product_images`
- `id uuid primary key`
- `product_id uuid`
- `storage_path text`
- `alt_text text`
- `sort_order integer`

### `inventory`
- `variant_id uuid primary key`
- `available_qty integer`
- `reserved_qty integer`
- timestamps

### `carts`
- `id uuid primary key`
- `customer_id uuid unique nullable`
- timestamps

### `cart_items`
- `cart_id uuid`
- `variant_id uuid`
- `quantity integer`
- composite uniqueness on `(cart_id, variant_id)`

### `orders`
- `id uuid primary key`
- `order_number text unique`
- `customer_id uuid nullable`
- `status text`
- `payment_status text`
- `currency text`
- `subtotal numeric`
- `discount_total numeric`
- `shipping_total numeric`
- `grand_total numeric`
- shipping/billing snapshot fields
- `placed_at timestamptz`
- timestamps

### `order_items`
- `id uuid primary key`
- `order_id uuid`
- `product_id uuid`
- `variant_id uuid`
- `sku text`
- `title_snapshot text`
- `size_snapshot text`
- `unit_price numeric`
- `quantity integer`
- `line_total numeric`

**Important:** order items are structured rows; do not continue storing the cart as one comma-separated `items` string.

### `payments`
- `id uuid primary key`
- `order_id uuid`
- `provider text`
- `provider_order_id text unique`
- `provider_payment_id text unique nullable`
- `status text`
- `amount numeric`
- `currency text`
- timestamps

### `payment_events`
- `id uuid primary key`
- `provider text`
- `event_id text unique`
- `event_type text`
- `payload jsonb`
- `processed_at timestamptz nullable`

This gives webhook processing an idempotency key.

### `addresses`
- `id uuid primary key`
- `customer_id uuid`
- contact and shipping address fields
- `is_default boolean`

### `wishlists` / `wishlist_items`
Either retain the existing normalized wishlist table or migrate to a customer-owned collection with unique `(customer_id, product_id)`.

### `reviews`
- `id uuid primary key`
- `customer_id uuid`
- `product_id uuid`
- `order_item_id uuid nullable`
- `rating integer`
- `body text`
- `status text`
- timestamps

Review creation should be controlled by an eligibility rule (for example, purchased/delivered item) rather than a simple public insert.

### `admin_roles`
- `user_id uuid references auth.users(id)`
- `role text`
- timestamps

### `audit_logs`
- actor/user
- action
- entity
- entity_id
- metadata jsonb
- timestamp

## 5. Order lifecycle contract

### Cash on delivery
`cart -> validate -> create order -> reserve/commit inventory -> status=confirmed/pending fulfilment -> fulfilment -> delivered`

### Online payment
`cart -> validate -> calculate authoritative total -> create internal pending order -> create Razorpay order -> checkout -> server verification -> webhook reconciliation -> payment_status=paid -> commit inventory/fulfilment`

### Allowed order states (initial proposal)
`pending`, `confirmed`, `processing`, `dispatched`, `delivered`, `cancelled`, `return_requested`, `returned`, `refunded`

Do not reuse one field for both fulfilment and payment state.

### Allowed payment states (initial proposal)
`pending`, `authorized`, `captured`, `failed`, `refunded`, `partially_refunded`

## 6. Pricing contract

At checkout, client submits only identifiers and quantities plus optional coupon information.

Server/database resolves:
1. current variant price
2. availability
3. discount/coupon eligibility
4. shipping rule
5. tax rule if applicable
6. final total

The value persisted to the order is the authoritative server calculation.

## 7. Inventory contract

Minimum safe behavior:
- reject unavailable variants
- reject non-positive or absurd quantities
- protect against concurrent overselling
- reserve inventory when an order requires a reservation
- release reservations on timeout/cancellation according to policy
- decrement/commit only from trusted server/database logic

## 8. RLS contract (design, not yet applied)

For every exposed table:
- enable RLS
- specify role with `to authenticated` / `to anon` where appropriate
- separate SELECT/INSERT/UPDATE/DELETE policies
- use `auth.uid()` for ownership checks
- use `with check` for writes that must preserve ownership
- keep public catalog read-only unless a field is intentionally public
- do not expose admin mutation through unrestricted client grants

**UNVERIFIED:** live policies still need to be inspected and tested in the actual Supabase project.

## 9. Storage contract

Product images move from Base64-in-row to Supabase Storage:
- upload file
- validate MIME/type/size
- generate stable storage path
- store path/URL metadata in DB
- render optimized image variants where practical
- enforce storage object policies

## 10. Frontend migration contract

Target stack:
- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Supabase SSR/server utilities where appropriate
- schema validation (e.g. Zod)
- small, explicit client state where UI state truly needs it

Do not move every state value into a global store. Server state and domain operations belong at the server/data layer; ephemeral UI state stays local.

Next.js supports incremental adoption/migration patterns, so the migration should be staged rather than a destructive rewrite.

## 11. Layer 0 acceptance criteria

Layer 0 is complete only when:
- [ ] This document is committed to the repository.
- [ ] `docs/AI_CONTEXT.md` exists and is updated.
- [ ] Real Supabase schema is exported/saved as migrations or otherwise versioned.
- [ ] RLS/grants/functions/storage policies are captured as code, not tribal knowledge.
- [ ] A backup/tag of the current prototype exists.
- [ ] A staging environment exists before destructive migrations.
- [ ] No production payment keys or service-role secrets are stored in source.
- [ ] The team agrees that price, stock, authorization, and payment status are server/database truths.

## 12. Immediate next engineering layer

After Layer 0 is accepted, do **not** start payment or visual redesign.

Next:

**Layer 1A — Database Contract & RLS Inventory**
1. Export the real schema.
2. List every table, column, foreign key, unique constraint, index, trigger and function.
3. List every RLS policy and grant.
4. Compare live schema to this proposed model.
5. Mark each difference as keep / migrate / remove.
6. Add SQL migrations under version control.
7. Write RLS tests before changing the frontend.

