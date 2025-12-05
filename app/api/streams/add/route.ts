import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import * as youtubesearchapi from "youtube-search-api";
import { extractYoutubeId, YT_REGEX } from "@/app/lib/utils";
import { convex, api } from "@/app/lib/convexClient";

// Input validation schema
const CreateStreamSchema = z.object({
  roomSlug: z.string(),
  userId: z.string(),
  url: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const data = CreateStreamSchema.parse(await request.json());

    // Validate YouTube URL format
    const isYt = data.url.match(YT_REGEX);
    if (!isYt) {
      return NextResponse.json(
        { success: false, message: "Wrong URL format" },
        { status: 400 }
      );
    }

    // Extract video ID
    const extractedId = extractYoutubeId(data.url);
    if (!extractedId) {
      return NextResponse.json(
        { success: false, message: "Unable to extract video ID from URL" },
        { status: 400 }
      );
    }

    // Initialize videoDetails
    let videoDetails: { title?: string; thumbnail?: any } = {};

    try {
      videoDetails = await youtubesearchapi.GetVideoDetails(extractedId);
    } catch (apiErr) {
      console.warn("youtube-search-api failed", apiErr);
    }

    // Extract thumbnails if available
    let thumbnails = Array.isArray(videoDetails?.thumbnail?.thumbnails)
      ? videoDetails.thumbnail.thumbnails
      : [];

    // Fallback: use oEmbed API if thumbnails are missing or title is undefined
    if (thumbnails.length === 0 || !videoDetails.title) {
      try {
        const oembedRes = await fetch(
          `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${extractedId}&format=json`
        );

        if (!oembedRes.ok) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Failed to fetch video data from YouTube oEmbed API fallback",
              debug: { extractedId, videoDetails },
            },
            { status: 400 }
          );
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
        return NextResponse.json(
          {
            success: false,
            message:
              "Failed to fetch video data from YouTube oEmbed API fallback",
            debug: { extractedId, videoDetails, oembedError },
          },
          { status: 400 }
        );
      }
    }

    // Final check for title
    if (!videoDetails.title) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or unavailable video. Title missing.",
          debug: { extractedId, videoDetails },
        },
        { status: 400 }
      );
    }

    // Sort thumbnails by width descending
    thumbnails.sort(
      (a: { width?: number }, b: { width?: number }) =>
        (b?.width ?? 0) - (a?.width ?? 0)
    );

    // Create new stream via Convex
    const response = await convex.mutation(api.streams.addStream, {
      roomSlug: data.roomSlug,
      userId: data.userId,
      url: data.url,
      extractedId,
      type: "Youtube",
      title: videoDetails.title,
      smallImg:
        thumbnails[1]?.url ||
        "https://fastly.picsum.photos/id/237/200/300.jpg?hmac=TmmQSbShHz9CdQm0NkEjx1Dyh_Y984R9LpNrpvH2D_U",
      bigImage:
        thumbnails[0]?.url ||
        "https://fastly.picsum.photos/id/237/200/300.jpg?hmac=TmmQSbShHz9CdQm0NkEjx1Dyh_Y984R9LpNrpvH2D_U",
    });

    if (!response.success) {
      return NextResponse.json(
        { success: false, message: response.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Stream added successfully",
        stream: response.stream,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error while adding stream:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Validation failed", issues: error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
