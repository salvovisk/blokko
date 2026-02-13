import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createTemplateSchema, validateRequest } from '@/lib/validations';

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

    // Pagination parameters
    const { searchParams } = req.nextUrl;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100); // Max 100 per page
    const skip = (page - 1) * limit;

    const where = {
      OR: [
        { isSystem: true },
        { userId: user.id },
      ],
    };

    // Get total count for pagination metadata
    const total = await prisma.template.count({ where });

    // Get system templates + user's templates
    const templates = await prisma.template.findMany({
      where,
      orderBy: [
        { isSystem: 'desc' }, // System templates first
        { updatedAt: 'desc' },
      ],
      skip,
      take: limit,
    });

    // Parse content and add isOwner flag
    const parsed = templates.map((t) => {
      try {
        return {
          ...t,
          blocks: JSON.parse(t.content),
          isOwner: t.userId === user.id,
        };
      } catch (e) {
        console.error(`Failed to parse template ${t.id}:`, e);
        return {
          ...t,
          blocks: [],
          isOwner: t.userId === user.id,
        };
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

    // Validate input with Zod
    const validation = validateRequest(createTemplateSchema, {
      name: body.name,
      description: body.description,
      content: JSON.stringify(body.blocks || []),
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { name, description, content } = validation.data;

    // Validate blocks array is not empty
    const blocks = JSON.parse(content);
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
        content,
        userId: user.id,
        isSystem: false,
      },
    });

    try {
      return NextResponse.json(
        { ...template, blocks: JSON.parse(template.content) },
        { status: 201 }
      );
    } catch (e) {
      console.error('Failed to parse created template:', e);
      return NextResponse.json(
        { ...template, blocks: [] },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    );
  }
}
