import { NextRequest, NextResponse } from "next/server";
import { convex, api } from "@/app/lib/convexClient";
import { Id } from "@/convex/_generated/dataModel";

export async function POST(request:NextRequest){
  const { streamId, userId } = await request.json();

  if (!streamId || !userId) {
    return NextResponse.json(
      { error: "Missing streamId or userId" },
      { status: 400 }
    );
  }

  const res = await convex.mutation(api.streams.downvote, {
    streamId: streamId as Id<"streams">,
    userId,
  });

  return NextResponse.json(res, { status: 200 });
}
