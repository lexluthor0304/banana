import { Env, getCredits } from '../utils/credits';

const uidFrom = (req: Request) =>
  (req.headers.get('cookie') || '').match(/uid=([^;]+)/)?.[1] || '';

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  const uid = uidFrom(request);
  const credits = await getCredits(env, uid);
  return new Response(JSON.stringify({ uid, credits }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
