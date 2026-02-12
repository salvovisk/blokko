import { NextResponse } from 'next/server';

// Simple health check endpoint for monitoring
export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'blokko-landing',
    },
    { status: 200 }
  );
}
