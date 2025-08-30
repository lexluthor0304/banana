import { MeCredits, Pack } from './types';

async function handleJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { code?: string };
    throw new Error(err.code || 'error_api');
  }
  return (res.json() as Promise<T>);
}

export async function getMeCredits(): Promise<MeCredits> {
  const res = await fetch('/api/me-credits');
  return handleJson<MeCredits>(res);
}

export async function checkout(pack: Pack): Promise<{ url: string }> {
  const res = await fetch('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pack }),
  });
  return handleJson<{ url: string }>(res);
}

export async function edit(image: File, prompt: string): Promise<Blob> {
  const form = new FormData();
  form.append('image', image);
  form.append('prompt', prompt);
  const res = await fetch('/api/edit', {
    method: 'POST',
    body: form,
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { code?: string };
    throw new Error(err.code || 'error_api');
  }
  return res.blob();
}

export async function register(
  username: string,
  password: string,
): Promise<void> {
  const res = await fetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  await handleJson<unknown>(res);
}

export async function login(
  username: string,
  password: string,
): Promise<void> {
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  await handleJson<unknown>(res);
}
