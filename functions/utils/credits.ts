export interface Env {
  CREDITS_KV: KVNamespace;
  GEMINI_API_KEY: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_PRICE_ID_10: string;
  STRIPE_PRICE_ID_50: string;
  STRIPE_WEBHOOK_SECRET: string;
}

const key = (userId: string) => `credits:${userId}`;

export async function getCredits(env: Env, userId: string): Promise<number> {
  const val = await env.CREDITS_KV.get(key(userId));
  return val ? Number(val) : 0;
}

export async function addCredits(
  env: Env,
  userId: string,
  delta: number,
): Promise<number> {
  const curr = await getCredits(env, userId);
  const next = curr + delta;
  await env.CREDITS_KV.put(key(userId), String(next));
  return next;
}

export async function consumeCredit(env: Env, userId: string): Promise<number> {
  const curr = await getCredits(env, userId);
  if (curr < 1) throw new Error('NO_CREDITS');
  const next = curr - 1;
  await env.CREDITS_KV.put(key(userId), String(next));
  return next;
}
