import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Convex schema mirroring the previous Prisma models.
 * Adjust as you flesh out Convex functions, but this gives you the core tables now.
 */
export default defineSchema({
  users: defineTable({
    // Clerk user id
    clerkId: v.string(),
    email: v.string(),
    username: v.string(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_username", ["username"])
    .index("by_email", ["email"]),

  streams: defineTable({
    // Clerk user id of the creator (aligns with users.clerkId)
    creatorId: v.string(),
    roomId: v.optional(v.id("rooms")),
    url: v.string(),
    extractedId: v.string(),
    type: v.string(), // e.g., "Youtube"
    title: v.string(),
    smallImg: v.string(),
    bigImage: v.string(),
    played: v.boolean(),
    playedTs: v.optional(v.number()), // epoch ms when played
    createdAt: v.number(), // epoch ms when created
  })
    .index("by_creator_played", ["creatorId", "played"])
    .index("by_creator_extracted", ["creatorId", "extractedId"])
    .index("by_room_played", ["roomId", "played"])
    .index("by_room_extracted", ["roomId", "extractedId"]),

  upvotes: defineTable({
    // Clerk user id of the voter
    userId: v.string(),
    streamId: v.id("streams"),
  })
    .index("by_user_stream", ["userId", "streamId"])
    .index("by_stream", ["streamId"]),

  currentStreams: defineTable({
    // Active stream per creator
    userId: v.string(), // creator (Clerk) id
    roomId: v.optional(v.id("rooms")),
    streamId: v.id("streams"),
  })
    .index("by_user", ["userId"])
    .index("by_room", ["roomId"]),

  rooms: defineTable({
    ownerId: v.string(),
    name: v.string(),
    slug: v.string(),
    createdAt: v.number(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_slug", ["slug"]),

  roomMembers: defineTable({
    roomId: v.id("rooms"),
    userId: v.string(),
    joinedAt: v.number(),
  })
    .index("by_room", ["roomId"])
    .index("by_user_room", ["userId", "roomId"]),
});
