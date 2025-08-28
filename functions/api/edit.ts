import { Env, consumeCredit, getCredits } from '../utils/credits';
import { callGemini } from '../utils/gemini';

const uidFrom = (req: Request) =>
  (req.headers.get('cookie') || '').match(/uid=([^;]+)/)?.[1] || '';

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  const uid = uidFrom(request);
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
      JSON.stringify({ error: 'upload required', code: 'error_upload_required' }),
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
    return new Response(
      JSON.stringify({ error: 'api', code: 'error_api' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};
