import Stripe from 'stripe';
import { Env, addCredits } from '../utils/credits';

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  const signature = request.headers.get('stripe-signature') || '';
  const arrayBuffer = await request.arrayBuffer();
  const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: '2022-11-15',
    httpClient: Stripe.createFetchHttpClient(),
  });
  let event: Stripe.Event;
  try {
    const text = new TextDecoder().decode(arrayBuffer);
    event = await stripe.webhooks.constructEventAsync(
      text,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error('Webhook error', err);
    return new Response('bad signature', { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const uid = session.metadata?.uid || '';
    let priceId: string | undefined;
    try {
      const full = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ['line_items'],
      });
      priceId = full.line_items?.data?.[0]?.price?.id;
    } catch (e) {
      console.error('retrieve session', e);
    }
    let delta = 0;
    if (priceId === env.STRIPE_PRICE_ID_10) delta = 10;
    if (priceId === env.STRIPE_PRICE_ID_50) delta = 50;
    if (uid && delta > 0) {
      await addCredits(env, uid, delta);
    }
  }

  return new Response('ok');
};
