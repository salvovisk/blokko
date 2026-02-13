import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/templates - List user's templates + system templates
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

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

    // Get system templates + user's templates
    const templates = await prisma.template.findMany({
      where: {
        OR: [
          { isSystem: true },
          { userId: user.id },
        ],
      },
      orderBy: [
        { isSystem: 'desc' }, // System templates first
        { updatedAt: 'desc' },
      ],
    });

    // Parse content and add isOwner flag
    const parsed = templates.map((t) => ({
      ...t,
      blocks: JSON.parse(t.content),
      isOwner: t.userId === user.id,
    }));

    return NextResponse.json(parsed, { status: 200 });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

// POST /api/templates - Create new template
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
    const { name, description, blocks } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    if (!blocks || blocks.length === 0) {
      return NextResponse.json(
        { error: 'At least one block is required' },
        { status: 400 }
      );
    }

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

    const template = await prisma.template.create({
      data: {
        name,
        description: description || null,
        content: JSON.stringify(blocks),
        userId: user.id,
        isSystem: false,
      },
    });

    return NextResponse.json(
      { ...template, blocks: JSON.parse(template.content) },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    );
  }
}
