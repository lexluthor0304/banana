import { Env } from './utils/credits';

export const onRequest: PagesFunction<Env> = async ({ request, env, next }) => {
  const cookie = request.headers.get('cookie') || '';
  const sid = cookie.match(/sid=([^;]+)/)?.[1];
  if (sid) {
    const uid = await env.CREDITS_KV.get(`session:${sid}`);
    if (uid) {
      request.headers.set('x-user-id', uid);
      await env.CREDITS_KV.put(`session:${sid}`, uid, {
        expirationTtl: 60 * 60 * 24,
      });
      const res = await next();
      res.headers.append(
        'Set-Cookie',
        `sid=${sid}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400`,
      );
      return res;
    }
  }
  return next();
};
