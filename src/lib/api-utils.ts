import { NextResponse } from 'next/server';

/**
 * Read a JSON body. Returns a 400 response instead of throwing on malformed
 * input, so bad requests never surface as 500s.
 */
export async function readJson(
  req: Request
): Promise<{ ok: true; body: Record<string, unknown> } | { ok: false; response: NextResponse }> {
  try {
    const body = await req.json();
    if (body === null || typeof body !== 'object' || Array.isArray(body)) {
      throw new Error('Body must be a JSON object');
    }
    return { ok: true, body };
  } catch {
    return { ok: false, response: NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }) };
  }
}

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

/** Parse ?page & ?limit, falling back to sane defaults for junk values. */
export function parsePagination(searchParams: URLSearchParams) {
  const rawPage = Number.parseInt(searchParams.get('page') ?? '', 10);
  const rawLimit = Number.parseInt(searchParams.get('limit') ?? '', 10);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, MAX_LIMIT) : DEFAULT_LIMIT;
  return { page, limit, skip: (page - 1) * limit };
}
