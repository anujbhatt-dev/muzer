import { prismaClient } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import * as youtubesearchapi from "youtube-search-api";
import { extractYoutubeId, YT_REGEX } from "@/app/lib/utils";

// Input validation schema
const CreateStreamSchema = z.object({
  creatorName: z.string(),
  url: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate input
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

    // Get video details using youtube-search-api
    let videoDetails = await youtubesearchapi.GetVideoDetails(extractedId);

    // Check if thumbnail info is missing or invalid
    let thumbnails = Array.isArray(videoDetails?.thumbnail?.thumbnails)
      ? videoDetails.thumbnail.thumbnails
      : [];

    // Fallback to YouTube oEmbed API if thumbnails missing
    if (thumbnails.length === 0) {
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

        // Override title and thumbnails from oEmbed response
        videoDetails.title = oembed.title;
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

    // Validate title presence after fallback
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

    // Get user by username
    const user = await prismaClient.user.findUnique({
      where: { username: data.creatorName },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Check if stream already exists for this user
    const existingStream = await prismaClient.stream.findFirst({
      where: {
        creatorId: user.id,
        extractedId,
        played: false,
      },
    });

    if (existingStream) {
      return NextResponse.json(
        { success: false, message: "This stream already exists" },
        { status: 409 }
      );
    }

    // Create stream
    const stream = await prismaClient.stream.create({
      data: {
        creatorId: user.id,
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
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Stream added successfully",
        data: stream,
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
