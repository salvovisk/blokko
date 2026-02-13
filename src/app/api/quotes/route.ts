import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createQuoteSchema, validateRequest } from '@/lib/validations';

// GET /api/quotes - List all quotes for authenticated user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Pagination parameters
    const { searchParams } = req.nextUrl;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100); // Max 100 per page
    const skip = (page - 1) * limit;

    // Optional status filter
    const status = searchParams.get('status');

    const where = {
      user: {
        email: session.user.email,
      },
      ...(status && { status }),
    };

    // Get total count for pagination metadata
    const total = await prisma.quote.count({ where });

    const quotes = await prisma.quote.findMany({
      where,
      orderBy: {
        updatedAt: 'desc',
      },
      skip,
      take: limit,
    });

    const parsed = quotes.map((q) => {
      try {
        return { ...q, blocks: JSON.parse(q.content) };
      } catch (e) {
        console.error(`Failed to parse quote ${q.id}:`, e);
        return { ...q, blocks: [] };
      }
    });

    return NextResponse.json({
      data: parsed,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quotes' },
      { status: 500 }
    );
  }
}

// POST /api/quotes - Create new quote
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();

    // Validate input with Zod
    const validation = validateRequest(createQuoteSchema, {
      title: body.title,
      description: body.description,
      content: JSON.stringify(body.blocks || []),
      status: body.status,
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { title, description, content, status } = validation.data;

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const quote = await prisma.quote.create({
      data: {
        title,
        description: description || '',
        content,
        status,
        userId: user.id,
      },
    });

    try {
      return NextResponse.json({ ...quote, blocks: JSON.parse(quote.content) }, { status: 201 });
    } catch (e) {
      console.error('Failed to parse created quote:', e);
      return NextResponse.json({ ...quote, blocks: [] }, { status: 201 });
    }
  } catch (error) {
    console.error('Error creating quote:', error);
    return NextResponse.json(
      { error: 'Failed to create quote' },
      { status: 500 }
    );
  }
}
