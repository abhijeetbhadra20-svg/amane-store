AMANE STORE — STEP 3

This version adds real Supabase Auth integration to the existing storefront.

Before committing to GitHub:
1. Open index.html.
2. Find SUPABASE_PUBLISHABLE_KEY.
3. Replace the placeholder with your sb_publishable_... key.
4. Never use a secret/service-role key here.

What this version changes:
- Real Email/Password Sign In and Sign Up.
- Google Sign In.
- Orders require a signed-in Supabase user.
- create-order receives the user's access token.
- My Orders are loaded from the orders table using the authenticated user's customer_id.
- Track Order checks the signed-in user's order in Supabase.
- Existing visual design and cart flow are preserved.

No payment gateway is enabled yet.
