import { prismaClient } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

// Schema to validate request body
const MeSchema = z.object({
  id: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = MeSchema.parse(body);

    const user = await prismaClient.user.findUnique({
      where: { id: data.id },
      select: { username: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
  console.log("user: "+JSON.stringify(user));
  
    return NextResponse.json({ username: user.username });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json( {error: "Invalid request data"}, { status: 400 });
    }

    console.error("Internal error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
