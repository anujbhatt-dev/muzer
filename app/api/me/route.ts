import { NextRequest, NextResponse } from "next/server";
import { convex, api } from "@/app/lib/convexClient";
import { createClerkClient } from "@clerk/backend";

export async function POST(request: NextRequest) {
  const { id } = await request.json();

  if (!id) {
    return NextResponse.json(
      { error: "Missing id in request body" },
      { status: 400 }
    );
  }

  let user = await convex.query(api.users.getMe, { clerkId: id });

  // If user is missing in Convex, try to register from Clerk profile
  if (!user) {
    try {
      const secretKey = process.env.CLERK_SECRET_KEY;
      if (!secretKey) {
        return NextResponse.json(
          { error: "CLERK_SECRET_KEY not set on server" },
          { status: 500 }
        );
      }

      const clerk = createClerkClient({ secretKey });
      const clerkUser = await clerk.users.getUser(id);
      const email =
        clerkUser.emailAddresses?.[0]?.emailAddress ||
        clerkUser.primaryEmailAddressId
          ? clerkUser.emailAddresses.find(
              (e) => e.id === clerkUser.primaryEmailAddressId
            )?.emailAddress
          : undefined;

      if (!email) {
        return NextResponse.json(
          { error: "User email not found" },
          { status: 404 }
        );
      }

      const registered = await convex.mutation(api.users.registerUser, {
        clerkId: id,
        email,
        usernameHint: clerkUser.username ?? clerkUser.firstName ?? undefined,
      });

      user = registered
        ? {
            username: registered.username,
            email: registered.email,
            clerkId: registered.clerkId,
          }
        : null;
    } catch (err) {
      console.error("Failed to sync user from Clerk", err);
      return NextResponse.json(
        { error: "User not found and sync failed" },
        { status: 404 }
      );
    }
  }

  return NextResponse.json({ username: user!.username });
}
