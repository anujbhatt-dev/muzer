import { action, mutation, query, type ActionCtx } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { api } from "./_generated/api";
import * as youtubesearchapi from "youtube-search-api";

const enrichStream = async (
  db: any,
  stream: any,
  askerId?: string
) => {
  const upvotes = await db
    .query("upvotes")
    .withIndex("by_stream", (q: any) => q.eq("streamId", stream._id))
    .collect();
  const upvoteCount = upvotes.length;
  const hasUpvoted = askerId
    ? upvotes.some((vote: any) => vote.userId === askerId)
    : false;

  return { ...stream, upvotes: upvoteCount, hasUpvoted };
};

const YT_REGEX =
  /^(?:(?:https?:)?\/\/)?(?:www\.)?(?:m\.)?(?:youtu(?:be)?\.com\/(?:v\/|embed\/|watch(?:\/|\?v=))|youtu\.be\/)((?:\w|-){11})(?:\S+)?$/;

const extractYoutubeId = (url: string): string | null => {
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.hostname.includes("youtube.com")) {
      return parsedUrl.searchParams.get("v");
    }
    if (parsedUrl.hostname === "youtu.be") {
      return parsedUrl.pathname.split("/")[1] || null;
    }
    return null;
  } catch {
    return null;
  }
};

export const listStreams = query({
  args: {
    roomSlug: v.string(),
    askerId: v.optional(v.string()),
  },
  handler: async ({ db }, { roomSlug, askerId }) => {
    const room = await db
      .query("rooms")
      .withIndex("by_slug", (q) => q.eq("slug", roomSlug))
      .first();
    if (!room) {
      return { streams: [], activeStream: null, error: "Room not found" };
    }

    const creator = await db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", room.ownerId))
      .first();

    const isOwner = !!askerId && room.ownerId === askerId;

    const membership = askerId
      ? await db
          .query("roomMembers")
          .withIndex("by_user_room", (q) =>
            q.eq("userId", askerId).eq("roomId", room._id)
          )
          .first()
      : null;

    const streams = await db
      .query("streams")
      .withIndex("by_room_played", (q) =>
        q.eq("roomId", room._id).eq("played", false)
      )
      .collect();

    const annotated = await Promise.all(
      streams.map((s: any) => enrichStream(db, s, askerId))
    );

    annotated.sort((a, b) => {
      if (b.upvotes !== a.upvotes) return b.upvotes - a.upvotes;
      return a.createdAt - b.createdAt;
    });

    const current = await db
      .query("currentStreams")
      .withIndex("by_room", (q) => q.eq("roomId", room._id))
      .first();
    let activeStream = null;
    if (current) {
      const stream = await db.get(current.streamId as Id<"streams">);
      if (stream) {
        activeStream = { ...stream, _id: current.streamId };
      }
    }

    return {
      streams: annotated,
      activeStream: activeStream ? { stream: activeStream } : null,
      room,
      ownerUsername: creator?.username ?? null,
      isOwner,
      isMember: !!membership || isOwner,
    };
  },
});

export const addStream = mutation({
  args: {
    roomSlug: v.string(),
    userId: v.string(),
    url: v.string(),
    extractedId: v.string(),
    type: v.string(),
    title: v.string(),
    smallImg: v.string(),
    bigImage: v.string(),
  },
  handler: async (
    { db },
    { roomSlug, userId, url, extractedId, type, title, smallImg, bigImage }
  ) => {
    const room = await db
      .query("rooms")
      .withIndex("by_slug", (q) => q.eq("slug", roomSlug))
      .first();
    if (!room) {
      return { success: false, message: "Room not found" };
    }

    const member = await db
      .query("roomMembers")
      .withIndex("by_user_room", (q) =>
        q.eq("userId", userId).eq("roomId", room._id)
      )
      .first();
    const isOwner = room.ownerId === userId;
    if (!member && !isOwner) {
      return { success: false, message: "Join the room to add a stream" };
    }

    const existing = await db
      .query("streams")
      .withIndex("by_room_extracted", (q) =>
        q.eq("roomId", room._id).eq("extractedId", extractedId)
      )
      .first();

    if (existing && !existing.played) {
      return { success: false, message: "This stream already exists" };
    }

    const streamId = await db.insert("streams", {
      creatorId: room.ownerId,
      roomId: room._id,
      url,
      extractedId,
      type,
      title,
      smallImg,
      bigImage,
      played: false,
      createdAt: Date.now(),
    });

    const stream = await db.get(streamId);
    return { success: true, stream };
  },
});

export const upvote = mutation({
  args: { streamId: v.id("streams"), userId: v.string() },
  handler: async ({ db }, { streamId, userId }) => {
    const stream = await db.get(streamId);
    if (!stream) return { success: false, message: "Stream not found" };
    if (!stream.roomId) {
      return { success: false, message: "Stream is missing room context" };
    }

    const roomMember = await db
      .query("roomMembers")
      .withIndex("by_user_room", (q) =>
        q.eq("userId", userId).eq("roomId", stream.roomId as Id<"rooms">)
      )
      .first();
    const isOwner = stream.creatorId === userId;
    if (!roomMember && !isOwner) {
      return { success: false, message: "Join the room to vote" };
    }

    const existing = await db
      .query("upvotes")
      .withIndex("by_user_stream", (q) =>
        q.eq("userId", userId).eq("streamId", streamId)
      )
      .first();
    if (existing) {
      return { success: true, message: "Already upvoted" };
    }

    await db.insert("upvotes", { streamId, userId });
    return { success: true };
  },
});

export const downvote = mutation({
  args: { streamId: v.id("streams"), userId: v.string() },
  handler: async ({ db }, { streamId, userId }) => {
    const stream = await db.get(streamId);
    if (!stream) return { success: false, message: "Stream not found" };
    if (!stream.roomId) {
      return { success: false, message: "Stream is missing room context" };
    }

    const roomMember = await db
      .query("roomMembers")
      .withIndex("by_user_room", (q) =>
        q.eq("userId", userId).eq("roomId", stream.roomId as Id<"rooms">)
      )
      .first();
    const isOwner = stream.creatorId === userId;
    if (!roomMember && !isOwner) {
      return { success: false, message: "Join the room to vote" };
    }

    const existing = await db
      .query("upvotes")
      .withIndex("by_user_stream", (q) =>
        q.eq("userId", userId).eq("streamId", streamId)
      )
      .first();
    if (existing) {
      await db.delete(existing._id);
    }
    return { success: true };
  },
});

export const playNext = mutation({
  args: {
    roomSlug: v.string(),
    requesterId: v.string(),
  },
  handler: async ({ db }, { roomSlug, requesterId }) => {
    const room = await db
      .query("rooms")
      .withIndex("by_slug", (q) => q.eq("slug", roomSlug))
      .first();

    if (!room) return { success: false, message: "Room not found" };

    if (room.ownerId !== requesterId) {
      return { success: false, message: "Only the room owner can play next" };
    }

    const streams = await db
      .query("streams")
      .withIndex("by_room_played", (q) =>
        q.eq("roomId", room._id).eq("played", false)
      )
      .collect();

    if (!streams.length) {
      return { success: false, message: "No stream available" };
    }

    const annotated = await Promise.all(
      streams.map((s: any) => enrichStream(db, s, undefined))
    );
    annotated.sort((a, b) => {
      if (b.upvotes !== a.upvotes) return b.upvotes - a.upvotes;
      return a.createdAt - b.createdAt;
    });

    const next = annotated[0];
    const now = Date.now();

    await db.patch(next._id as Id<"streams">, {
      played: true,
      playedTs: now,
    });

    const current = await db
      .query("currentStreams")
      .withIndex("by_room", (q) => q.eq("roomId", room._id))
      .first();

    if (current) {
      await db.patch(current._id, { streamId: next._id });
    } else {
      await db.insert("currentStreams", {
        userId: room.ownerId,
        roomId: room._id,
        streamId: next._id,
      });
    }

    return { success: true, stream: next };
  },
});

type AddStreamResult = {
  success: boolean;
  message?: string;
  stream?: any;
  debug?: Record<string, unknown>;
};

export const addStreamWithMeta = action({
  args: {
    roomSlug: v.string(),
    userId: v.string(),
    url: v.string(),
  },
  handler: async (
    ctx: ActionCtx,
    {
      roomSlug,
      userId,
      url,
    }: { roomSlug: string; userId: string; url: string }
  ): Promise<AddStreamResult> => {
    if (!url.match(YT_REGEX)) {
      return { success: false, message: "Wrong URL format" };
    }

    const extractedId = extractYoutubeId(url);
    if (!extractedId) {
      return {
        success: false,
        message: "Unable to extract video ID from URL",
      };
    }

    let videoDetails: {
      title?: string;
      thumbnail?: { thumbnails?: { url: string; width?: number }[] };
    } = {};
    try {
      videoDetails = await youtubesearchapi.GetVideoDetails(extractedId);
    } catch (err) {
      console.warn("youtube-search-api failed", err);
    }

    let thumbnails: { url: string; width?: number }[] = Array.isArray(
      videoDetails?.thumbnail?.thumbnails
    )
      ? (videoDetails.thumbnail?.thumbnails as { url: string; width?: number }[])
      : [];

    if (thumbnails.length === 0 || !videoDetails.title) {
      try {
        const oembedRes = await fetch(
          `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${extractedId}&format=json`
        );

        if (!oembedRes.ok) {
          return {
            success: false,
            message:
              "Failed to fetch video data from YouTube oEmbed API fallback",
            debug: { extractedId, videoDetails },
          };
        }

        const oembed = await oembedRes.json();
        videoDetails = {
          title: oembed.title,
        };
        thumbnails = [
          {
            url: oembed.thumbnail_url,
            width: 480,
          },
        ];
      } catch (oembedError) {
        return {
          success: false,
          message: "Failed to fetch video data from YouTube oEmbed API fallback",
          debug: { extractedId, videoDetails, oembedError },
        };
      }
    }

    if (!videoDetails.title) {
      return {
        success: false,
        message: "Invalid or unavailable video. Title missing.",
        debug: { extractedId, videoDetails },
      };
    }

    thumbnails.sort(
      (a: { width?: number }, b: { width?: number }) =>
        (b?.width ?? 0) - (a?.width ?? 0)
    );

    const fallbackImage =
      "https://fastly.picsum.photos/id/237/200/300.jpg?hmac=TmmQSbShHz9CdQm0NkEjx1Dyh_Y984R9LpNrpvH2D_U";

    const response: AddStreamResult = await ctx.runMutation(
      api.streams.addStream,
      {
        roomSlug,
        userId,
        url,
        extractedId,
        type: "Youtube",
        title: videoDetails.title,
        smallImg: thumbnails[1]?.url || fallbackImage,
        bigImage: thumbnails[0]?.url || fallbackImage,
      }
    );

    return response;
  },
});
