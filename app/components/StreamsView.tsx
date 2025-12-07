"use client"
import React, { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { useAuth } from '@clerk/nextjs';
import { Loader, ThumbsUp, Share } from 'lucide-react';
//@ts-ignore
import youtubeThumbnail from "youtube-thumbnail"
import { AnimatePresence, motion } from "motion/react"
import YouTube from 'react-youtube';
import { IconArrowNarrowRightDashed, IconPlaylist, IconSparkles } from '@tabler/icons-react';
import { AnimatedTooltip } from './animated-tooltip';
import Image from 'next/image';
import { BackgroundGradient } from './ui/background-gradient';
import { toast } from 'sonner';
import { useAction, useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { StreamSidebar } from './StreamSidebar';

interface YouTubeVideo {
    id: string;
    _id?: string;
    type: "Youtube";
    active?: boolean;
    userId?: string;
    creatorId?: string;
    title: string;
    smallImg: string;
    bigImage: string;
    url: string;
    extractedId: string;
    upvotes:number;
    hasUpvoted: boolean;
    playedTs?: number | string;
}


interface StreamRoomSchema {
   [username:string]:OnlineUserSchema
}

interface OnlineUserSchema {
  socketId: string;
  fullName: string;
  imageUrl: string;
}

type StreamsData = {
  streams?: any[] | { streams?: any[] };
  activeStream?: { stream: any } | null;
  room?: { name?: string; slug?: string };
  ownerUsername?: string | null;
  isOwner?: boolean;
  isMember?: boolean;
  error?: string;
};

  


export default function StreamsView({
  roomSlug,
  playVideo = false,
  autoJoin = true,
  onRoomSelect,
}: {
  roomSlug: string;
  playVideo: boolean;
  autoJoin?: boolean;
  onRoomSelect?: (slug: string) => void;
}) {
  const { userId, isLoaded } = useAuth();
  const authReady = isLoaded;
  const [songInput, setSongInput] = useState("");
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const playerRef = useRef<any>(null);
  const [nextLoading, setNextLoading] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[] | null>(null);
  const [streamRoomDetails, setStreamRoomDetails] = useState<StreamRoomSchema | null>(null);
  const [addStreamLoading, setAddStreamLoading] = useState(false);
  const [joiningRoom, setJoiningRoom] = useState(false);
  const autoJoinAttempted = useRef(false);
  const autoNextTriggered = useRef(false);

  const fallbackThumb = "/pic.jpg";
  const surface: CSSProperties = { background: "var(--card)", borderColor: "var(--border)" };
  const surfaceStrong: CSSProperties = { background: "var(--card-strong)", borderColor: "var(--border-strong)" };
  const panel: CSSProperties = { background: "var(--panel)", borderColor: "var(--border)" };
  const textPrimary = "text-[color:var(--text-primary)]";
  const textSecondary = "text-[color:var(--text-secondary)]";

  const ensureVideoPlaying = useCallback(() => {
    const player = playerRef.current;
    const ytState = (typeof window !== "undefined" && (window as any).YT?.PlayerState) || {};
    if (!player || typeof player.getPlayerState !== "function" || !ytState) return;

    const state = player.getPlayerState();
    if (state === ytState.ENDED) return;

    if (
      state === ytState.PAUSED ||
      state === ytState.UNSTARTED ||
      state === ytState.BUFFERING ||
      state === ytState.CUED
    ) {
      try {
        player.playVideo();
      } catch (error) {
        console.warn("Unable to force playback", error);
      }
    }
  }, []);

  const streamsData = useQuery(
    api.streams.listStreams,
    roomSlug ? { roomSlug, askerId: userId ?? undefined } : "skip"
  ) as unknown as StreamsData | undefined;

  const addStreamAction = useAction(api.streams.addStreamWithMeta);
  const upvoteMutation = useMutation(api.streams.upvote);
  const downvoteMutation = useMutation(api.streams.downvote);
  const playNextMutation = useMutation(api.streams.playNext);
  const joinRoomMutation = useMutation(api.rooms.joinRoom);

  const normalizedStreams = useMemo(() => {
    const streamsRoot = streamsData?.streams;
    const incomingStreamsRaw = Array.isArray(streamsRoot)
      ? streamsRoot
      : streamsRoot &&
        typeof streamsRoot === "object" &&
        "streams" in streamsRoot &&
        Array.isArray((streamsRoot as { streams?: any[] }).streams)
      ? (streamsRoot as { streams?: any[] }).streams ?? []
      : [];

    return Array.isArray(incomingStreamsRaw)
      ? incomingStreamsRaw.map((s: any) => ({
          ...s,
          id: s._id ?? s.id,
          _id: s._id ?? s.id,
          upvotes: typeof s.upvotes === "number" ? s.upvotes : 0,
          hasUpvoted: !!s.hasUpvoted,
          userId: s.userId ?? s.creatorId,
          smallImg:
            typeof s.smallImg === "string" && s.smallImg.trim() !== ""
              ? s.smallImg
              : fallbackThumb,
          bigImage:
            typeof s.bigImage === "string" && s.bigImage.trim() !== ""
              ? s.bigImage
              : fallbackThumb,
        }))
      : [];
  }, [streamsData, fallbackThumb]);

  const currentStream = useMemo(() => {
    const stream = streamsData?.activeStream?.stream;
    if (!stream) return null;
    return {
      ...stream,
      id: stream._id ?? stream.id,
      _id: stream._id ?? stream.id,
      upvotes: typeof stream.upvotes === "number" ? stream.upvotes : 0,
      hasUpvoted: !!(stream as any).hasUpvoted,
      userId: (stream as any).userId ?? stream.creatorId,
      active: true,
    } as YouTubeVideo;
  }, [streamsData]);

  const seekTime = useMemo(() => {
    if (currentStream?.playedTs) {
      const diff = Math.floor(
        (Date.now() - new Date(currentStream.playedTs).getTime()) / 1000
      );
      return diff + 2;
    }
    return 0;
  }, [currentStream?.playedTs]);

  const roomMeta = useMemo(
    () => ({
      name: streamsData?.room?.name ?? roomSlug,
      slug: streamsData?.room?.slug ?? roomSlug,
      ownerUsername: streamsData?.ownerUsername ?? null,
      isOwner: !!streamsData?.isOwner,
      isMember: !!streamsData?.isMember,
    }),
    [streamsData, roomSlug]
  );

  const streamsLoading = roomSlug ? streamsData === undefined : false;
  const canControlPlayback = roomMeta?.isOwner && playVideo;
  const canContribute = roomMeta?.isOwner || roomMeta?.isMember;
  const canUseSidebar = roomMeta?.isOwner || roomMeta?.isMember;
  const shareUrl =
    (typeof window !== "undefined"
      ? `${process.env.NEXT_PUBLIC_FRONTEND_URL || window.location.origin}/room/${roomSlug}`
      : "");

  const handleSubmit = async () => {
    if (!authReady) return;
    if (!userId) {
      toast.error("Sign in to add a stream");
      return;
    }
    if (!canContribute) {
      toast.error("Join the room to add a stream");
      return;
    }

    try {
      setAddStreamLoading(true);
      const res = await addStreamAction({
        roomSlug,
        userId,
        url: songInput,
      });

      if (!res?.success) {
        toast.error(res?.message || "Error during adding stream");
        return;
      }
      setSongInput("");
      setThumbnail("");
      toast.success("Song added successfully");
    } catch (error) {
      console.error("Error during adding stream:", error);
      toast.error("Error during adding stream");
    } finally {
      setAddStreamLoading(false);
    }
  };

  const joinRoom = useCallback(async () => {
    if (!authReady) return;
    if (!userId) {
      toast.error("Sign in to join the room");
      return;
    }

    try {
      setJoiningRoom(true);
      const res = await joinRoomMutation({
        roomSlug,
        userId,
      });
      if (!res?.success) {
        toast.error(res?.message || "Failed to join room");
        return;
      }
      toast.success("Joined room");
    } catch (error) {
      toast.error("Failed to join room");
    } finally {
      setJoiningRoom(false);
    }
  }, [authReady, joinRoomMutation, roomSlug, userId]);

  const handleShare = async () => {
    if (!shareUrl) {
      toast.error("Missing share URL");
      return;
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Room link copied");
    } catch (err) {
      toast.error("Unable to copy link");
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      if (songInput.includes("youtube.com") || songInput.includes("youtu.be")) {
        const thumb = youtubeThumbnail(songInput);
        setThumbnail(thumb?.medium?.url);
      }
    }, 500);
  
    return () => clearTimeout(handler);
  }, [songInput]);
  
  

  useEffect(() => {
    if (!authReady) return;
    if (streamsData?.error) {
      if (!userId) {
        toast("Sign in to load this room and join the queue");
      } else {
        toast(streamsData.error || "Failed to fetch streams");
      }
    }
  }, [streamsData, authReady, userId]);
  

  // Auto-join after sign-in when viewing a room
  useEffect(() => {
    if (!autoJoin) return;
    if (!authReady) return;
    if (!userId) {
      autoJoinAttempted.current = false;
      return;
    }
    if (autoJoinAttempted.current) return;
    if (roomMeta && !roomMeta.isMember && !roomMeta.isOwner) {
      autoJoinAttempted.current = true;
      joinRoom();
    }
  }, [autoJoin, authReady, userId, roomMeta, joinRoom]);
  

  useEffect(() => {
    const resumeOnVisibility = () => ensureVideoPlaying();

    document.addEventListener("visibilitychange", resumeOnVisibility);
    window.addEventListener("focus", resumeOnVisibility);
    window.addEventListener("pageshow", resumeOnVisibility);
    window.addEventListener("blur", resumeOnVisibility);

    // Lightweight keep-alive to avoid the micro-pause when returning to the tab.
    const ticker = window.setInterval(resumeOnVisibility, 500);

    return () => {
      document.removeEventListener("visibilitychange", resumeOnVisibility);
      window.removeEventListener("focus", resumeOnVisibility);
      window.removeEventListener("pageshow", resumeOnVisibility);
      window.removeEventListener("blur", resumeOnVisibility);
      window.clearInterval(ticker);
    };
  }, [ensureVideoPlaying]);

  useEffect(() => {
    ensureVideoPlaying();

    // Explicitly load and play the next video when the active stream changes, even in a background tab.
    if (playerRef.current && currentStream?.extractedId) {
      try {
        if (typeof playerRef.current.loadVideoById === "function") {
          playerRef.current.loadVideoById(currentStream.extractedId);
        }
        playerRef.current.playVideo?.();
      } catch (error) {
        console.warn("Unable to start next stream automatically", error);
      }
    }
  }, [currentStream?._id, currentStream?.extractedId, ensureVideoPlaying]);

  useEffect(() => {
    if (!canControlPlayback) {
      autoNextTriggered.current = false;
      return;
    }
    if (currentStream) {
      autoNextTriggered.current = false;
      return;
    }
    if (!streamsLoading && normalizedStreams.length > 0 && !nextLoading && !autoNextTriggered.current) {
      autoNextTriggered.current = true;
      playNext();
    }
  }, [canControlPlayback, currentStream, normalizedStreams.length, streamsLoading, nextLoading]);

  const handlePlayerStateChange = useCallback((event: any) => {
    const ytState = (typeof window !== "undefined" && (window as any).YT?.PlayerState) || {};
    if (!ytState || !event?.target) return;

    // Some browsers pause background iframes when the tab blurs; kick it back into play unless the video ended.
    if (
      event.data === ytState.PAUSED ||
      event.data === ytState.CUED ||
      event.data === ytState.UNSTARTED
    ) {
      event.target.playVideo?.();
    }
  }, []);

  const playNext = async () => {
    if (nextLoading) return;
    if (!authReady) return;
    if (!userId) {
      toast.error("Sign in to control playback");
      return;
    }
    if (!roomMeta?.isOwner) {
      toast.error("Only the room owner can play next");
      return;
    }
    try {
      setNextLoading(true);
      const res = await playNextMutation({
        roomSlug,
        requesterId: userId,
      });
      if (!res?.success) {
        toast.error(res?.message || "Error during playing next stream");
      } else {
        toast.success("Next Stream Playing");
      }
    } catch (error) {
      console.log(error);
      toast.error("Error during playing next stream");
    } finally {
      setTimeout(() => {
        setNextLoading(false);
      }, 2000);
    }
  };

  const handleVote = async (streamId: Id<"streams">, voteType: string) => {
    if (!authReady) return;
    if (!userId) {
      toast.error("Sign in to vote");
      return;
    }
    if (!canContribute) {
      toast.error("Join the room to vote");
      return;
    }
    try {
      if (voteType === "upvote") {
        const res = await upvoteMutation({
          streamId,
          userId,
        });
        if (!res?.success) {
          toast.error(res?.message || "Unable to vote");
        }
      } else {
        const res = await downvoteMutation({
          streamId,
          userId,
        });
        if (!res?.success) {
          toast.error(res?.message || "Unable to vote");
        }
      }
    } catch (error) {
      toast.error("Unable to vote right now");
    }
  };


  return (
    <div className="md:px-5 mb-[20rem]">
      <div className="flex gap-6">
        {canUseSidebar && (
          <StreamSidebar activeSlug={roomSlug} onRoomSelect={onRoomSelect} />
        )}
        <div className="flex-1">
          <div className={`flex flex-row md:items-center justify-between gap-2 text-sm ${textSecondary}`}>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span
                className={`px-3 py-1 rounded-full border text-sm font-semibold ${textPrimary}`}
                style={surfaceStrong}
              >
                {roomMeta?.name ?? roomSlug}
              </span>
              {!roomMeta?.isOwner && roomMeta?.ownerUsername && (
                <span className="text-xs uppercase tracking-[0.12em] text-[color:var(--accent-rose)]">
                  Hosted by @{roomMeta.ownerUsername}
                </span>
              )}
            </div> 
            <div className="flex gap-2">
              <button
                onClick={handleShare}
                className={`text-xs px-3 py-2 rounded-full border flex items-center gap-2 ${textPrimary}`}
                style={surface}
              >
                <Share className="h-4 w-4" /> Share
              </button>
              {!roomMeta?.isOwner && !roomMeta?.isMember && (
                <button
                  disabled={joiningRoom || !authReady}
                  onClick={joinRoom}
                  className={`text-xs px-3 py-2 rounded-full border disabled:opacity-60 ${textPrimary}`}
                  style={surfaceStrong}
                >
                  {joiningRoom ? "Joining..." : !authReady ? "Preparing..." : "Join room"}
                </button>
              )}
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="my-6 mx-auto w-full"
          >
            <div
              className="relative overflow-hidden rounded-3xl border px-4 py-4 sm:px-6 sm:py-5 shadow-lg"
              style={{ ...surfaceStrong, boxShadow: "0 24px 50px rgba(0,0,0,0.08)" }}
            >
              <div className="absolute -left-10 -top-16 h-44 w-44 rounded-full blur-3xl opacity-60" style={{ background: "var(--accent-amber-soft)" }} />
              <div className="absolute -right-10 bottom-0 h-40 w-40 rounded-full blur-3xl opacity-60" style={{ background: "var(--accent-cyan-soft)" }} />

              <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                {thumbnail && !thumbnail.includes("null") && (
                  <Image
                    width={120}
                    height={120}
                    className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl object-cover border shadow-md"
                    style={surface}
                    src={thumbnail}
                    alt="Preview thumbnail"
                  />
                )}

                <div className="flex-1 space-y-2">
                  <div className={`flex items-center justify-between text-xs uppercase tracking-[0.16em] ${textSecondary}`}>
                    <span>Start streaming</span>
                    <span className="text-[10px] text-[color:var(--accent-amber)]">Paste a YouTube link</span>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <input
                      placeholder="Paste a YouTube song URL to queue it up"
                      className={`w-full rounded-2xl border px-4 py-3 text-sm placeholder:text-[color:var(--text-secondary)] focus:outline-none focus:ring-2 ${textPrimary}`}
                      style={surface}
                      type="text"
                      value={songInput}
                      onChange={(e) => setSongInput(e.target.value)}
                      aria-label="YouTube song URL"
                    />
                    <button
                      type="submit"
                      disabled={addStreamLoading}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-[0_16px_38px_rgba(0,0,0,0.16)] disabled:cursor-not-allowed disabled:opacity-70"
                      style={{ background: "linear-gradient(120deg, var(--accent-amber), var(--accent-rose), var(--accent-cyan))", boxShadow: "0 18px 46px rgba(0,0,0,0.12)" }}
                    >
                      {addStreamLoading ? (
                        <>
                          <Loader className="h-4 w-4 animate-spin" />
                          Adding
                        </>
                      ) : (
                        <>
                          <span className="text-nowrap">Add to queue</span>
                          <IconArrowNarrowRightDashed className="h-5 w-5" />
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-[color:var(--text-secondary)]">
                    Press Enter or tap the arrow to drop the track in for everyone.
                  </p>
                </div>
              </div>
            </div>
          </form>

          {currentStream || (normalizedStreams && normalizedStreams?.length > 0) ? (
            <div className="flex flex-col-reverse lg:flex-row-reverse justify-between gap-x-4 gap-y-2">
              {normalizedStreams && normalizedStreams.length ? (
                <div className="min-h-full  flex-1 ">
                  <div className="flex flex-col gap-y-4 ">
                    <div className={`flex items-center gap-2 text-sm uppercase mt-8 md:mt-0 ${textSecondary} tracking-wide`}>
                      <IconPlaylist className="h-4 w-4" style={{ color: "var(--accent-rose)" }} />
                      <span>Watch Next</span>
                      <span className="h-px flex-1 bg-gradient-to-r from-[color:var(--accent-rose)]/50 via-[color:var(--accent-amber)]/30 to-transparent"></span>
                    </div>
                    <AnimatePresence>
                      {normalizedStreams.map((stream, i) => (
                        <div key={stream.id + i}>
                          <motion.div
                            layout
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            transition={{
                              duration: 0.3,
                              ease: [0.25, 0.46, 0.45, 0.94],
                              delay: i * 0.05,
                            }}
                            className={`flex flex-wrap md:flex-row gap-x-2  gap-y-4 md:items-center justify-between p-2 lg:p-4 rounded-lg ${textPrimary}`}
                            style={{ ...surface, boxShadow: "0 14px 36px rgba(0,0,0,0.08)" }}
                          >
                            <div className="">
                              <Image
                                width={150}
                                height={100}
                                alt={stream.title}
                                src={stream.bigImage}
                                className="w-[6rem] h-auto rounded-md object-cover"
                              />
                            </div>
                            <div className="flex-1 self-start">
                              <p className={`text-sm md:text-md ${textPrimary}`}>{stream.title}</p>
                              <div className="mt-1 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold" style={surface}>
                                <span className={`${textSecondary} uppercase tracking-[0.12em]`}>Votes</span>
                                <span className="text-[color:var(--accent-rose)] text-sm">{stream.upvotes}</span>
                              </div>
                            </div>
                            <div
                              onClick={() =>
                                handleVote(
                                  (stream._id ?? stream.id) as Id<"streams">,
                                  stream.hasUpvoted ? "downvote" : "upvote"
                                )
                              }
                              className="cursor-pointer px-3 py-3 flex items-center self-start gap-4 rounded-lg max-w-sm mx-auto transition-all duration-150 md:mx-4"
                              style={{ ...surfaceStrong, boxShadow: "0 10px 26px rgba(0,0,0,0.1)" }}
                            >
                              <ThumbsUp className="w-4 h-4 " fill={stream.hasUpvoted ? "var(--accent-rose)" : "transparent"} />
                            </div>
                          </motion.div>
                          {normalizedStreams.length > 1 && i == 0 && (
                            <div className={`text-sm uppercase mt-4 ${textSecondary}`}>Upcoming Song</div>
                          )}
                        </div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              ) : (
                <div
                  className="flex items-center justify-center flex-1 relative rounded-3xl overflow-hidden min-h-[60%] px-4 py-8"
                  style={{ ...panel, borderRadius: "1.5rem" }}
                >
                  <div className="absolute inset-0">
                    <div className="absolute -top-24 -left-16 h-64 w-64 rounded-full blur-3xl opacity-60" style={{ background: "var(--accent-rose-soft)" }} />
                    <div className="absolute bottom-[-80px] left-1/4 h-72 w-72 rounded-full blur-3xl opacity-60" style={{ background: "var(--accent-cyan-soft)" }} />
                    <div className="absolute -right-20 top-6 h-60 w-60 rounded-full blur-3xl opacity-60" style={{ background: "var(--accent-amber-soft)" }} />
                  </div>
                  <BackgroundGradient
                    containerClassName="w-full max-w-xl mx-auto"
                    className="rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-xl"
                  >
                    <div className="flex flex-col gap-4 sm:gap-5 text-center items-center rounded-2xl border p-4 sm:p-6" style={panel}>
                      <div
                        className="flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] tracking-[0.2em] uppercase"
                        style={surface}
                      >
                        <IconSparkles className="h-4 w-4" style={{ color: "var(--accent-amber)" }} />
                        Queue empty
                      </div>
                      <p className={`text-xl sm:text-2xl font-semibold leading-tight ${textPrimary}`}>
                        Add the first track for everyone
                      </p>
                      <p className={`text-sm ${textSecondary} max-w-md`}>
                        Drop a YouTube link above and we'll line it up for the room.
                      </p>
                      <div className={`flex flex-wrap justify-center gap-2 text-[11px] ${textSecondary}`}>
                        <span className="px-3 py-1 rounded-full border" style={surface}>Quick add</span>
                        <span className="px-3 py-1 rounded-full border" style={surface}>Ad-free</span>
                        <span className="px-3 py-1 rounded-full border" style={surface}>Shared queue</span>
                      </div>
                    </div>
                  </BackgroundGradient>
                </div>
              )}

              <div className="flex-1 flex flex-col gap-y-8 backdrop-blur-3xl rounded-2xl">
                {/* current stream */}
                <div className="">
                  <div>
                    <div className="overflow-hidden mb-4">
                      {currentStream?.extractedId && (
                        // <BackgroundGradient
                        //   containerClassName="block"
                        //   className="rounded-2xl overflow-hidden border border-white/10 shadow-lg shadow-purple-500/10"
                        // >
                          <YouTube
                            videoId={currentStream?.extractedId}
                            title={currentStream?.title}
                            iframeClassName="h-[200px] md:h-[350px] lg:h-[500px] w-full"
                            onEnd={canControlPlayback ? playNext : undefined}
                            loading="eager"
                            onStateChange={handlePlayerStateChange}
                            onReady={(e) => {
                              const player = e.target;
                              playerRef.current = player;
                              if (typeof player.getIframe === "function") {
                                try {
                                  const maybeIframe = player.getIframe();
                                  if (maybeIframe instanceof Promise) {
                                    maybeIframe
                                      .then((iframe: HTMLIFrameElement) => {
                                        iframe?.setAttribute("allow", "autoplay; fullscreen; picture-in-picture");
                                      })
                                      .catch(() => {});
                                  } else if (maybeIframe) {
                                    (maybeIframe as HTMLIFrameElement).setAttribute(
                                      "allow",
                                      "autoplay; fullscreen; picture-in-picture"
                                    );
                                  }
                                } catch {
                                  // no-op if getIframe not available in this environment
                                }
                              }
                              if (typeof player.seekTo === "function" && typeof seekTime === "number") {
                                player.seekTo(seekTime);
                              }
                              player.playVideo();
                            }}
                            opts={{
                              playerVars: {
                                autoplay: 1,
                                mute: 0,
                                modestbranding: 1,
                                controls: 1,
                                playsinline: 1,
                              },
                            }}
                            className="mx-auto lg:rounded-2xl overflow-hidden"
                          />
                        // </BackgroundGradient>
                      )}
                    </div>

                    {canControlPlayback && (
                      <div
                        onClick={playNext}
                        className={`${nextLoading && "opacity-30"} flex flex-col lg:flex-row mx-auto lg:items-center justify-between cursor-pointer px-2 pb-2`}
                      >
                        <div className="lg:w-2/3 text-sm opacity-80 hover:opacity-100 transition-all duration-150">
                          {currentStream?.title}
                        </div>
                        {normalizedStreams && normalizedStreams.length > 0 && (
                          <div className="flex items-center justify-end cursor-pointer gap-x-2">
                            <div className={`${textSecondary} text-sm uppercase`}>Next</div>
                            <IconArrowNarrowRightDashed className="w-14 h-14 hover:animate-pulse" />
                          </div>
                        )}
                      </div>
                    )}

                    {/* online users */}
                    {onlineUsers && onlineUsers.length > 0 && streamRoomDetails && (
                      <div className="mb-4 ml-2">
                        <div className={`${textSecondary} text-sm uppercase mb-2 mt-8`}>Online users</div>
                        <div className="flex gap-2">
                          {onlineUsers.map((onlineuser, i) => (
                            <div className="" key={i}>
                              {/* {onlineuser} */}
                              <img
                                title={onlineuser}
                                className="w-[2rem] h-[2rem] rounded-full"
                                src={streamRoomDetails[onlineuser].imageUrl}
                                alt={`Profile picture of ${onlineuser}`}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {/*  */}
              </div>
            </div>
          ) : (
            <div
              className="relative min-h-[60vh] flex items-center justify-center overflow-hidden rounded-3xl border shadow-2xl px-6 py-12 sm:px-10 max-w-6xl mx-auto"
              style={{ ...panel, boxShadow: "0 26px 64px rgba(0,0,0,0.12)" }}
            >
              <div className="pointer-events-none absolute -top-16 -left-10 h-64 w-64 rounded-full blur-3xl opacity-60" style={{ background: "var(--accent-rose-soft)" }} />
              <div className="pointer-events-none absolute -bottom-20 right-0 h-72 w-72 rounded-full blur-3xl opacity-60" style={{ background: "var(--accent-cyan-soft)" }} />

              <div className="relative w-full max-w-3xl text-center space-y-6">
                {streamsLoading ? (
                  <div
                    className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.18em]"
                    style={surface}
                  >
                    <Loader className="h-4 w-4 animate-spin" />
                    Fetching queue
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div
                      className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.18em]"
                      style={surface}
                    >
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      Start streaming
                    </div>

                    <div className="space-y-3">
                      <h2 className={`text-2xl sm:text-3xl font-semibold ${textPrimary}`}>
                        Add a YouTube song URL to kick things off
                      </h2>
                      <p className={`text-sm sm:text-base ${textSecondary} max-w-2xl mx-auto`}>
                        Drop a link in the field above and we will queue it for everyone. Bring your friends in by sharing the room link.
                      </p>
                    </div>

                    {thumbnail && thumbnail !== "" && !thumbnail.includes("null") && (
                      <div className="flex flex-col items-center gap-4 text-center max-w-xl w-full mx-auto">
                        <Image
                          width={1080}
                          height={916}
                          className="rounded-2xl w-full h-full max-h-[260px] object-cover border shadow-lg"
                          style={surface}
                          src={thumbnail}
                          alt="Upcoming stream preview"
                        />
                        <button
                          onClick={handleSubmit}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-[0_16px_38px_rgba(0,0,0,0.16)]"
                          style={{ background: "linear-gradient(120deg, var(--accent-amber), var(--accent-rose), var(--accent-cyan))", boxShadow: "0 18px 46px rgba(0,0,0,0.12)" }}
                          disabled={addStreamLoading}
                        >
                          {addStreamLoading ? "Adding..." : "Play now"}
                          {!addStreamLoading && <IconArrowNarrowRightDashed className="w-5 h-5" />}
                        </button>
                      </div>
                    )}

                    <p className={`text-xs ${textSecondary}`}>
                      Tip: paste the link, then hit enter or the arrow button to add it to the queue.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
