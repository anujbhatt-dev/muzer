import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

const slugify = (input: string) =>
  input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

export const createRoom = mutation({
  args: {
    ownerId: v.string(),
    name: v.string(),
  },
  handler: async ({ db }, { ownerId, name }) => {
    const owner = await db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", ownerId))
      .first();

    if (!owner) {
      return { success: false, message: "Owner not found" };
    }

    const baseSlug = slugify(name) || "room";
    const ownerHandle = slugify(owner.username) || "owner";
    let slug = `${ownerHandle}-${baseSlug}`;
    let suffix = 1;

    while (
      await db.query("rooms").withIndex("by_slug", (q) => q.eq("slug", slug)).first()
    ) {
      slug = `${ownerHandle}-${baseSlug}-${suffix++}`;
    }

    const roomId = await db.insert("rooms", {
      ownerId,
      name,
      slug,
      createdAt: Date.now(),
    });

    // Ensure owner is a member
    await db.insert("roomMembers", {
      roomId,
      userId: ownerId,
      joinedAt: Date.now(),
    });

    const room = await db.get(roomId as Id<"rooms">);
    return { success: true, room };
  },
});

export const joinRoom = mutation({
  args: {
    roomSlug: v.string(),
    userId: v.string(),
  },
  handler: async ({ db }, { roomSlug, userId }) => {
    const room = await db
      .query("rooms")
      .withIndex("by_slug", (q) => q.eq("slug", roomSlug))
      .first();

    if (!room) return { success: false, message: "Room not found" };

    const existing = await db
      .query("roomMembers")
      .withIndex("by_user_room", (q) => q.eq("userId", userId).eq("roomId", room._id))
      .first();
    if (existing) return { success: true, room };

    await db.insert("roomMembers", {
      roomId: room._id,
      userId,
      joinedAt: Date.now(),
    });

    return { success: true, room };
  },
});

export const listRoomsForUser = query({
  args: { userId: v.string() },
  handler: async ({ db }, { userId }) => {
    const owned = await db
      .query("rooms")
      .withIndex("by_owner", (q) => q.eq("ownerId", userId))
      .collect();

    const memberLinks = await db
      .query("roomMembers")
      .withIndex("by_user_room", (q) => q.eq("userId", userId))
      .collect();

    const memberRoomIds = memberLinks.map((link) => link.roomId);
    const memberRooms: any[] = [];

    for (const rid of memberRoomIds) {
      const room = await db.get(rid as Id<"rooms">);
      if (room && !owned.find((o) => o._id === room._id)) {
        memberRooms.push(room);
      }
    }

    return { owned, memberRooms };
  },
});

export const getRoom = query({
  args: { roomSlug: v.string() },
  handler: async ({ db }, { roomSlug }) => {
    const room = await db
      .query("rooms")
      .withIndex("by_slug", (q) => q.eq("slug", roomSlug))
      .first();
    return room ?? null;
  },
});
