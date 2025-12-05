import { NextRequest, NextResponse } from "next/server";
import { convex, api } from "@/app/lib/convexClient";

export async function POST(request: NextRequest) {
  const { roomSlug, userId } = await request.json();

  if (!roomSlug || !userId) {
    return NextResponse.json(
      { error: "Missing roomSlug or userId" },
      { status: 400 }
    );
  }

  const res = await convex.mutation(api.rooms.joinRoom, { roomSlug, userId });

  if (!res.success) {
    return NextResponse.json({ message: res.message }, { status: 400 });
  }

  return NextResponse.json({ room: res.room }, { status: 200 });
}
