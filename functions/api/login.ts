import { Env } from '../utils/credits';

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
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
};
