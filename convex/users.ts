import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Register or fetch a user coming from Clerk.
 * Ensures a unique username by appending a numeric suffix if needed.
 */
export const registerUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    usernameHint: v.optional(v.string()),
  },
  handler: async ({ db }, { clerkId, email, usernameHint }) => {
    const existing = await db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();
    if (existing) return existing;

    const baseFromEmail = email.split("@")[0] ?? "user";
    const base = (usernameHint ?? baseFromEmail)
      .replace(/[^a-zA-Z0-9]/g, "")
      .toLowerCase() || "user";

    let username = base;
    let suffix = 1;
    while (
      await db
        .query("users")
        .withIndex("by_username", (q) => q.eq("username", username))
        .first()
    ) {
      username = `${base}${suffix++}`;
    }

    const user = await db.insert("users", {
      clerkId,
      email,
      username,
    });

    return { _id: user, clerkId, email, username };
  },
});

export const getMe = query({
  args: { clerkId: v.string() },
  handler: async ({ db }, { clerkId }) => {
    const user = await db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();
    if (!user) return null;
    return { username: user.username, email: user.email, clerkId: user.clerkId };
  },
});
