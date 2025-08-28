# Gemini Image Editor

A React front‑end app that edits user supplied images with Google's `models/gemini-2.5-flash-image-preview`. The interface supports English, Chinese and Japanese automatically based on the browser locale. Users can upload an image, describe the desired edit, preview the edited result and download it.

> ⚠️ Image editing requires a valid Gemini API key and a Stripe payment flow. The current Stripe logic is a placeholder and requires a server side integration.

## Development

```bash
npm install
npm run dev
```

## Environment variables

Create a `.env` file with:

```bash
VITE_GEMINI_API_KEY=your_google_api_key
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key # optional, placeholder
```

## Building

```bash
npm run build
```

The output in `dist/` can be deployed on Cloudflare Pages.

## Stripe integration

`src/App.jsx` contains a `handlePayment` function using `@stripe/stripe-js`. Replace the placeholder alert with a call to a backend that creates a Checkout session and sets `paid` to true after successful payment.
