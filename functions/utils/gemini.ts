export const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent';

interface GeminiPart {
  inline_data?: { data?: string; mime_type?: string };
}
interface GeminiResponse {
  candidates?: { content?: { parts?: GeminiPart[] } }[];
}

export function parseGeminiImagePngBase64(json: unknown): string | null {
  const parts = (json as GeminiResponse).candidates?.[0]?.content?.parts;
  if (!parts) return null;
  for (const p of parts) {
    const data = p.inline_data?.data;
    const mime = p.inline_data?.mime_type;
    if (data && mime && mime.startsWith('image/')) {
      return data; // base64 string
    }
  }
  return null;
}

export async function callGemini(
  apiKey: string,
  base64: string,
  mime: string,
  prompt: string,
): Promise<string> {
  const body = {
    contents: [
      {
        role: 'user',
        parts: [
          { inline_data: { mime_type: mime, data: base64 } },
          { text: prompt || '' },
        ],
      },
    ],
  };
  const url = `${GEMINI_ENDPOINT}?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error('GEMINI_API_ERROR');
  }
  const json = (await res.json()) as GeminiResponse;
  const img = parseGeminiImagePngBase64(json);
  if (!img) throw new Error('NO_IMAGE');
  return img;
}
