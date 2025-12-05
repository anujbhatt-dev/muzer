import { NextRequest, NextResponse } from 'next/server';
import { convex, api } from '@/app/lib/convexClient';

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (body.type !== 'user.created') {
    return NextResponse.json({ message: 'Event ignored' });
  }

  const { id, email_addresses, username } = body.data ?? {};
  const email = email_addresses?.[0]?.email_address;

  if (!email || !id) {
    return NextResponse.json({ error: 'Missing user data' }, { status: 400 });
  }

  const result = await convex.mutation(api.users.registerUser, {
    clerkId: id,
    email,
    usernameHint: username,
  });

  return NextResponse.json({ success: true, user: result });
}
