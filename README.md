# Image Editor on Cloudflare Pages

A multi-language image editing web app using Google's Gemini model. Users buy credits via Stripe Checkout and spend one credit per edit. Built to run entirely on **Cloudflare Pages** with Pages Functions.

## Features
- Upload an image and optional prompt, edit via `gemini-2.5-flash-image-preview`.
- Preview and download the edited PNG.
- Anonymous users identified by `uid` cookie; credits stored in KV.
- Stripe Checkout selling 10 or 50 credit packs; webhook adds credits.
- Internationalisation (en/ja/zh) with auto‑detection and manual switch.
- Tailwind UI, TypeScript strict, ESLint + Prettier.
- Designed for future R2/D1 expansion.

## Stack
```
Browser --fetch--> Cloudflare Pages ----> Google Gemini API
          |                    |\
          |                    | \--> Stripe API / Webhooks
          |                    \--> KV (credits)
```

## Local Development
1. `cp .env.sample .env` and fill secrets.
2. Install deps: `pnpm install`.
3. Start dev server: `pnpm dev` (runs Vite + Pages Functions).
4. Visit http://localhost:8788.

### Simulating services
- **KV**: wrangler provides in‑memory KV during `pages dev`.
- **Stripe**: use test mode in dashboard; set webhook endpoint to `/api/stripe-webhook`.
- **Gemini**: requires real API key from Google AI Studio.

## Environment Variables
| name | description |
|------|-------------|
| `GEMINI_API_KEY` | Google Generative Language API key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_PRICE_ID_10` | Price ID selling 10 credits |
| `STRIPE_PRICE_ID_50` | Price ID selling 50 credits |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |

KV Binding: create namespace `CREDITS_KV` and bind in Pages project.

## Deployment
1. Push repo to GitHub and connect to Cloudflare Pages.
2. In Pages project settings:
   - Build command: `pnpm build`.
   - Build output: `dist`.
   - Add environment variables above.
   - Bind KV namespace `CREDITS_KV`.
3. Set Stripe webhook to `https://<your-domain>/api/stripe-webhook`.

## Troubleshooting
- **402 from /api/edit**: no credits; buy via Stripe.
- **Webhook 400**: check `STRIPE_WEBHOOK_SECRET`.
- **Image too large**: must be <10MB and `image/*` MIME type.

## Testing
Minimal script: after `pnpm dev` run, visit UI, buy credits using Stripe test card `4242 4242 4242 4242`, upload an image and prompt, verify result downloads.

## Future Work
- Store original/edited images in R2.
- Persist transactions in D1.
- Durable Objects for rate limiting.
