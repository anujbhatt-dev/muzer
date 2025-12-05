import { NextRequest, NextResponse } from "next/server";
import { convex, api } from "@/app/lib/convexClient";

export async function POST(request: NextRequest) {
  const { roomSlug, asker } = await request.json();

  if (!roomSlug) {
    return NextResponse.json({ error: "Missing roomSlug" }, { status: 400 });
  }

  const data = await convex.query(api.streams.listStreams, {
    roomSlug,
    askerId: asker ?? undefined,
  });

  return NextResponse.json(data, { status: 200 });
}
