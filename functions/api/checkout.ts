import Stripe from 'stripe';
import { Env } from '../utils/credits';
import type { Pack } from '../../src/lib/types';

const uidFrom = (req: Request) =>
  (req.headers.get('cookie') || '').match(/uid=([^;]+)/)?.[1] || '';

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  const body = await request.json<{
    pack: Pack;
  }>();
  const uid = uidFrom(request);
  const price =
    body.pack === '50' ? env.STRIPE_PRICE_ID_50 : env.STRIPE_PRICE_ID_10;
  const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: '2022-11-15',
    httpClient: Stripe.createFetchHttpClient(),
  });
  const origin = new URL(request.url).origin;
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price, quantity: 1 }],
    metadata: { uid },
    success_url: `${origin}/success`,
    cancel_url: `${origin}/cancel`,
  });
  return new Response(JSON.stringify({ url: session.url }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
