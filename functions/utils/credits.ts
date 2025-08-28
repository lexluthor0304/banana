export interface Env {
  CREDITS_KV: KVNamespace;
  GEMINI_API_KEY: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_PRICE_ID_10: string;
  STRIPE_PRICE_ID_50: string;
  STRIPE_WEBHOOK_SECRET: string;
}

const key = (uid: string) => `credits:${uid}`;

export async function getCredits(env: Env, uid: string): Promise<number> {
  const val = await env.CREDITS_KV.get(key(uid));
  return val ? Number(val) : 0;
}

export async function addCredits(
  env: Env,
  uid: string,
  delta: number,
): Promise<number> {
  const curr = await getCredits(env, uid);
  const next = curr + delta;
  await env.CREDITS_KV.put(key(uid), String(next));
  return next;
}

export async function consumeCredit(env: Env, uid: string): Promise<number> {
  const curr = await getCredits(env, uid);
  if (curr < 1) throw new Error('NO_CREDITS');
  const next = curr - 1;
  await env.CREDITS_KV.put(key(uid), String(next));
  return next;
}
