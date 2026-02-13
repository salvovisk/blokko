import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { updateQuoteSchema, validateRequest } from '@/lib/validations';

// GET /api/quotes/[id] - Get quote by ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const quote = await prisma.quote.findUnique({
      where: { id: id },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    if (!quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (quote.user.email !== session.user.email) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    try {
      return NextResponse.json({ ...quote, blocks: JSON.parse(quote.content) }, { status: 200 });
    } catch (e) {
      console.error(`Failed to parse quote ${quote.id}:`, e);
      return NextResponse.json({ ...quote, blocks: [] }, { status: 200 });
    }
  } catch (error) {
    console.error('Error fetching quote:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quote' },
      { status: 500 }
    );
  }
}

// PUT /api/quotes/[id] - Update quote
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const quote = await prisma.quote.findUnique({
      where: { id: id },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    if (!quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (quote.user.email !== session.user.email) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await req.json();

    // Validate input with Zod
    const validation = validateRequest(updateQuoteSchema, {
      title: body.title,
      description: body.description,
      content: body.blocks !== undefined ? JSON.stringify(body.blocks) : undefined,
      status: body.status,
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { title, description, content, status } = validation.data;

    const updatedQuote = await prisma.quote.update({
      where: { id: id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(content !== undefined && { content }),
        ...(status !== undefined && { status }),
      },
    });

    try {
      return NextResponse.json({ ...updatedQuote, blocks: JSON.parse(updatedQuote.content) }, { status: 200 });
    } catch (e) {
      console.error(`Failed to parse updated quote:`, e);
      return NextResponse.json({ ...updatedQuote, blocks: [] }, { status: 200 });
    }
  } catch (error) {
    console.error('Error updating quote:', error);
    return NextResponse.json(
      { error: 'Failed to update quote' },
      { status: 500 }
    );
  }
}

// DELETE /api/quotes/[id] - Delete quote
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const quote = await prisma.quote.findUnique({
      where: { id: id },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    if (!quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (quote.user.email !== session.user.email) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    await prisma.quote.delete({
      where: { id: id },
    });

    return NextResponse.json(
      { message: 'Quote deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting quote:', error);
    return NextResponse.json(
      { error: 'Failed to delete quote' },
      { status: 500 }
    );
  }
}
