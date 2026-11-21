# Maison Marketplace (`maisonfashion`)

A responsive fashion marketplace demo built with React, TypeScript, Vite, Tailwind CSS, and Supabase-ready infrastructure.

**Live site:** https://prernaingale501-bit.github.io/maisonfashion/  
**Source:** https://github.com/prernaingale501-bit/maisonfashion

## Run locally

```sh
npm install
npm run dev
```

`npm run build` runs the TypeScript project check and creates a production bundle in `dist/`.
`npm run build:pages` builds with the GitHub Pages project path.

## Supabase setup

1. Create a Supabase project and copy `.env.example` to `.env.local`.
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. The browser must only receive the public anon key; never put the service-role key in a `VITE_` variable.
3. Apply `supabase/migrations/202511210001_marketplace.sql` with the Supabase CLI or SQL editor.
4. Configure Edge Function secrets on the server:

   ```sh
   supabase secrets set SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=...
   supabase secrets set RAZORPAY_KEY_ID=... RAZORPAY_KEY_SECRET=... RAZORPAY_WEBHOOK_SECRET=...
   ```

5. Deploy `create-razorpay-order` and `razorpay-webhook`, then configure Razorpay to send `payment.captured` and `payment.failed` events to the webhook URL.

The migration creates the marketplace tables, indexes, auth profile trigger, vendor ownership helpers, storage buckets, and RLS policies. Checkout/order creation and payment state changes are intentionally restricted to trusted server-side code; the browser must not write payment records or verified order state directly.

## Demo scope

The storefront, collection filters/sorting, product details, wishlist, bag, vendor application, and vendor/admin dashboards use local demo data and client-side state. Forms are presentation flows only; customer details and orders are not persisted by the demo UI. Connect the app to `getSupabaseClient()` and implement authenticated queries before using it with real customers. The Razorpay Edge Functions are server-side scaffolding and require a persisted, authenticated order before they can be used. No live Supabase project or payment credentials are included.
