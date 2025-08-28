import { Env } from './utils/credits';

export const onRequest: PagesFunction<Env> = async ({ request, next }) => {
  const cookie = request.headers.get('cookie') || '';
  if (!/uid=/.test(cookie)) {
    const uid = crypto.randomUUID();
    const res = await next();
    res.headers.append(
      'Set-Cookie',
      `uid=${uid}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=31536000`,
    );
    return res;
  }
  return next();
};
