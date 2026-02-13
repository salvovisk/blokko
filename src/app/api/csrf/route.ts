import { NextResponse } from 'next/server';
import { generateCsrfToken } from '@/lib/csrf';

// GET /api/csrf - Get CSRF token
export async function GET() {
  try {
    const token = await generateCsrfToken();

    return NextResponse.json({ csrfToken: token }, { status: 200 });
  } catch (error) {
    console.error('Error generating CSRF token:', error);
    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    );
  }
}
