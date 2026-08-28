# Femme & Co. — E-commerce Demo Template

Ek complete female-fashion e-commerce site ka **working demo template**: catalog,
filters, cart, wishlist, checkout, phone-OTP login, order tracking, aur ek
admin panel — sab kaam karta hai bina kisi backend account ke, kyunki data
`localStorage` mein store hota hai.

Isse **live/production** banane ke liye neeche diye services connect karne
honge — code mein jahan-jahan plug karna hai wahan comments hain.

## Kaise chalayein
Koi build step nahi hai. Bas `index.html` ko browser mein kholo, ya poore
folder ko GitHub par push karke Vercel/Netlify par deploy kar do (drag-and-drop
bhi chal jayega).

## Folder structure
```
femme-store/
├── index.html              Home page
├── shop.html                Catalog + filters (category, size, price, search)
├── product.html              Product detail + reviews
├── cart.html                  Cart
├── checkout.html            Address + payment + place order
├── order-confirmation.html   Thank-you page
├── login.html                 Phone OTP login
├── account.html              Profile, order tracking, wishlist
├── admin.html                 Admin: orders, products, review approvals
├── css/style.css              Design tokens + shared styles
└── js/
    ├── store.js                Mock data + localStorage layer (the "backend")
    └── layout.js               Shared nav/footer injection
```

## Demo logins
- **Customer OTP:** koi bhi 10-digit number daalo, OTP hamesha `123456` hai.
- **Admin panel:** `admin@femme.demo` / `admin123`

## Connecting real services (production checklist)

Har jagah `js/store.js` mein comment hai "DEMO ONLY" ya "swap for real" —
wahi exact functions replace karne honge.

1. **Database + Auth — Supabase**
   `PRODUCTS`, cart, wishlist, orders — sab `js/store.js` mein hardcoded/localStorage
   hain. Inhe Supabase (Postgres) tables se replace karo: `products`,
   `orders`, `order_items`, `reviews`, `profiles`. Har `Store.xxx()` function
   ko async Supabase query se replace karna hoga.

2. **Phone OTP — MSG91**
   `Store.sendOtp()` aur `Store.verifyOtp()` abhi fixed `123456` OTP use karte
   hain. MSG91 ka "Send OTP" / "Verify OTP" API call yahan daalo. Supabase Auth
   ke saath bhi integrate kar sakte ho (phone provider).

3. **Payments — Razorpay**
   `checkout.html` mein payment method select hota hai but koi real charge
   nahi hota. Razorpay Checkout.js load karo, order create karne ke liye apna
   backend/edge-function endpoint banao (kabhi bhi secret key frontend mein
   mat daalna), aur payment verify server-side karo.

4. **Shipping / delivery — Shiprocket ya koi courier**
   Order "Placed → Packed → Shipped → Out for delivery → Delivered" status
   abhi admin panel se manually update hota hai. Real delivery ke liye
   Shiprocket (ya Delhivery) API se shipment create karo — wahi tracking
   number aur status updates bhejega.

5. **Pincode lookup — India Post API**
   `Store.lookupPincode()` mein sirf 5 demo pincodes hain. India Post ke
   official pincode API se replace karo for real serviceability check.

6. **Product images**
   Abhi `picsum.photos` placeholder images hain. Real product photos ke liye
   Supabase Storage (ya koi CDN) use karo.

7. **Order/email notifications**
   Order place hone par abhi kuch nahi bhejta. EmailJS (jaisa aapke Amane
   Store mein hai) ya WhatsApp Business API se confirmation bhejo.

## Security note (jab real backend lagao)
Frontend ko kabhi bhi price/stock/payment status ka source-of-truth mat
banao — ye sab server-side (Supabase RLS + edge functions) se validate
hona chahiye, jaisa aapke Amane Store audit mein already decide hua hai.
