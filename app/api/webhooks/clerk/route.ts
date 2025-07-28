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

    // Generate a base username from the email prefix
    let baseUsername = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    if (!baseUsername) baseUsername = "user";

    let username = baseUsername;
    let suffix = 1;

    // Ensure the username is unique
    while (await prismaClient.user.findUnique({ where: { username } })) {
      username = `${baseUsername}${suffix++}`;
    }

    // Save to Prisma
    await prismaClient.user.create({
      data: {
        id,
        email,
        username,
      },
    });

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ message: 'Event ignored' });
}
