import Stripe from 'stripe';
import { Env, getCredits, addCredits, consumeCredit } from '../functions/utils/credits';
import { callGemini } from '../functions/utils/gemini';
import type { Pack } from './lib/types';

const userIdFrom = (req: Request) => req.headers.get('x-user-id') || '';

async function handleMeCredits(request: Request, env: Env): Promise<Response> {
  const uid = userIdFrom(request);
  if (!uid) {
    return new Response('unauthorized', { status: 401 });
  }
  const credits = await getCredits(env, uid);
  return new Response(JSON.stringify({ uid, credits }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

async function handleLogin(request: Request, env: Env): Promise<Response> {
  const { username, password } = await request.json<{
    username: string;
    password: string;
  }>();
  if (!username || !password) {
    return new Response('bad request', { status: 400 });
  }
  const stored = await env.CREDITS_KV.get(`user:${username}`);
  if (!stored) {
    return new Response('unauthorized', { status: 401 });
  }
  const buf = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buf);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  if (hash !== stored) {
    return new Response('unauthorized', { status: 401 });
  }
  const sid = crypto.randomUUID();
  await env.CREDITS_KV.put(`session:${sid}`, username, {
    expirationTtl: 60 * 60 * 24,
  });
  const res = new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
  res.headers.append(
    'Set-Cookie',
    `sid=${sid}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400`,
  );
  return res;
}

async function handleRegister(request: Request, env: Env): Promise<Response> {
  const { username, password } = await request.json<{
    username: string;
    password: string;
  }>();
  if (!username || !password) {
    return new Response('bad request', { status: 400 });
  }
  const exists = await env.CREDITS_KV.get(`user:${username}`);
  if (exists) {
    return new Response(
      JSON.stringify({ error: 'user exists', code: 'error_user_exists' }),
      { status: 409, headers: { 'Content-Type': 'application/json' } },
    );
  }
  const buf = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buf);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  await env.CREDITS_KV.put(`user:${username}`, hash);
  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

async function handleCheckout(request: Request, env: Env): Promise<Response> {
  const body = await request.json<{ pack: Pack }>();
  const uid = userIdFrom(request);
  if (!uid) {
    return new Response('unauthorized', {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
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
}

async function handleEdit(request: Request, env: Env): Promise<Response> {
  const uid = userIdFrom(request);
  if (!uid) {
    return new Response(
      JSON.stringify({ error: 'unauthorized', code: 'error_unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } },
    );
  }
  const credits = await getCredits(env, uid);
  if (credits < 1) {
    return new Response(
      JSON.stringify({ error: 'no credits', code: 'error_no_credits' }),
      { status: 402, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const form = await request.formData();
  const file = form.get('image');
  const prompt = (form.get('prompt') as string) || '';
  if (!(file instanceof File)) {
    return new Response(
      JSON.stringify({
        error: 'upload required',
        code: 'error_upload_required',
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }
  if (file.size > 10 * 1024 * 1024) {
    return new Response(
      JSON.stringify({ error: 'too big', code: 'error_upload_required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }
  const arrayBuf = await file.arrayBuffer();
  const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuf)));
  try {
    const imgBase64 = await callGemini(
      env.GEMINI_API_KEY,
      base64,
      file.type,
      prompt,
    );
    await consumeCredit(env, uid);
    const bytes = Uint8Array.from(atob(imgBase64), (c) => c.charCodeAt(0));
    return new Response(bytes, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-store',
      },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: 'api', code: 'error_api' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function handleStripeWebhook(
  request: Request,
  env: Env,
): Promise<Response> {
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
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    const cookie = request.headers.get('cookie') || '';
    const sid = cookie.match(/sid=([^;]+)/)?.[1];
    let uid: string | null = null;
    if (sid) {
      const storedUid = await env.CREDITS_KV.get(`session:${sid}`);
      if (storedUid) {
        uid = storedUid;
        request = new Request(request);
        request.headers.set('x-user-id', uid);
        await env.CREDITS_KV.put(`session:${sid}`, uid, {
          expirationTtl: 60 * 60 * 24,
        });
      }
    }

    let res: Response;
    if (path === '/api/me-credits' && request.method === 'GET') {
      res = await handleMeCredits(request, env);
    } else if (path === '/api/login' && request.method === 'POST') {
      res = await handleLogin(request, env);
    } else if (path === '/api/register' && request.method === 'POST') {
      res = await handleRegister(request, env);
    } else if (path === '/api/checkout' && request.method === 'POST') {
      res = await handleCheckout(request, env);
    } else if (path === '/api/edit' && request.method === 'POST') {
      res = await handleEdit(request, env);
    } else if (path === '/api/stripe-webhook' && request.method === 'POST') {
      res = await handleStripeWebhook(request, env);
    } else {
      res = new Response('not found', { status: 404 });
    }

    if (sid && uid) {
      res.headers.append(
        'Set-Cookie',
        `sid=${sid}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400`,
      );
    }

    return res;
  },
};
