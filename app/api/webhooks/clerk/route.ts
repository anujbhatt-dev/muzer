import { prismaClient } from '@/app/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Ensure it's the `user.created` event
  if (body.type === 'user.created') {
    const { id, email_addresses } = body.data;

    const email = email_addresses?.[0]?.email_address;

    if (!email) {
      return NextResponse.json({ error: 'No email found' }, { status: 400 });
    }

    // Save to Prisma
    await prismaClient.user.create({
      data: {
        id,
        email,
      },
    });

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ message: 'Event ignored' });
}
