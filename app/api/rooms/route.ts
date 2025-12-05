import { NextRequest, NextResponse } from "next/server";
import { convex, api } from "@/app/lib/convexClient";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  const rooms = await convex.query(api.rooms.listRoomsForUser, { userId });
  return NextResponse.json(rooms, { status: 200 });
}

export async function POST(request: NextRequest) {
  const { ownerId, name } = await request.json();

  if (!ownerId || !name) {
    return NextResponse.json(
      { error: "Missing ownerId or name" },
      { status: 400 }
    );
  }

  const res = await convex.mutation(api.rooms.createRoom, { ownerId, name });
  if (!res.success) {
    return NextResponse.json({ message: res.message }, { status: 400 });
  }

  return NextResponse.json({ room: res.room }, { status: 201 });
}
