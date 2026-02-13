import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { updateProfileSchema, validateRequest } from '@/lib/validations';

// PUT /api/user/profile - Update user profile
export async function PUT(req: NextRequest) {
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
    const validation = validateRequest(updateProfileSchema, body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { name } = validation.data;

    // Find and update user
    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        ...(name !== undefined && { name }),
        // Email changes removed - requires verification flow for security
      },
    });

    return NextResponse.json(
      { success: true, name: user.name },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
