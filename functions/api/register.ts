import { Env } from '../utils/credits';

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
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
};
