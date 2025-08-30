import { Env, getCredits } from '../utils/credits';

const userIdFrom = (req: Request) => req.headers.get('x-user-id') || '';

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  const uid = userIdFrom(request);
  if (!uid) {
    return new Response('unauthorized', { status: 401 });
  }
  const credits = await getCredits(env, uid);
  return new Response(JSON.stringify({ uid, credits }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
