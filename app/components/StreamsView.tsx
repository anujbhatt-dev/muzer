"use client"
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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

  const fallbackThumb = "/pic.jpg";

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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-sm text-zinc-400">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-white font-semibold">
                {roomMeta?.name ?? roomSlug}
              </span>
              {!roomMeta?.isOwner && roomMeta?.ownerUsername && (
                <span className="text-xs uppercase tracking-[0.12em] text-zinc-500">
                  Hosted by @{roomMeta.ownerUsername}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleShare}
                className="text-xs px-3 py-2 rounded-full border border-zinc-700 hover:border-purple-500 flex items-center gap-2"
              >
                <Share className="h-4 w-4" /> Share
              </button>
              {!roomMeta?.isOwner && !roomMeta?.isMember && (
                <button
                  disabled={joiningRoom || !authReady}
                  onClick={joinRoom}
                  className="text-xs px-3 py-2 rounded-full border border-zinc-700 hover:border-purple-500 disabled:opacity-60"
                >
                  {joiningRoom ? "Joining..." : !authReady ? "Preparing..." : "Join room"}
                </button>
              )}
            </div>
          </div>

          <div className="my-4 flex justify-center gap-x-2 h-[4rem] relative mx-auto ">
            <input
              placeholder="Add Youtube Song URL"
              className="border rounded-2xl border-zinc-700/80 w-full mb-4 bg-transparent backdrop-blur-3xl text-center p-2 text-md h-full px-[5rem] lg:px-[10rem] outline-none"
              type="text"
              value={songInput}
              onChange={(e) => setSongInput(e.target.value)}
            />
            {thumbnail && !thumbnail.includes("null") && (
              <Image
                width={1080}
                height={916}
                className="rounded-full h-3/4 w-auto aspect-square absolute left-2 animate-spin top-[50%] -translate-y-[50%] object-cover"
                src={thumbnail}
                alt=""
              />
            )}

            <button
              disabled={addStreamLoading}
              onClick={handleSubmit}
              className="absolute right-4 flex top-[50%] -translate-y-[50%] cursor-pointer"
            >
              {!addStreamLoading ? (
                <IconArrowNarrowRightDashed className="w-10 h-10" />
              ) : (
                <Loader className="w-10 h-10 animate-spin" />
              )}
            </button>
          </div>

          {currentStream || (normalizedStreams && normalizedStreams?.length > 0) ? (
            <div className="flex flex-col-reverse lg:flex-row-reverse justify-between gap-x-4 gap-y-2">
              {normalizedStreams && normalizedStreams.length ? (
                <div className="min-h-full  flex-1 ">
                  <div className="flex flex-col gap-y-4 ">
                    <div className="flex items-center gap-2 text-sm uppercase mt-8 md:mt-0 text-zinc-400 tracking-wide">
                      <IconPlaylist className="h-4 w-4 text-purple-300" />
                      <span>Watch Next</span>
                      <span className="h-px flex-1 bg-gradient-to-r from-purple-500/60 via-fuchsia-500/30 to-transparent"></span>
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
                            className="flex flex-wrap md:flex-row gap-x-2  gap-y-4 md:items-center justify-between bg-zinc-900/80 p-2 lg:p-4 border border-zinc-400/20 shadow-md shadow-purple-900/10 rounded-lg"
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
                              <p className="text-zinc-300 text-sm md:text-md ">{stream.title}</p>
                              <p className="text-white ">
                                <span className="text-zinc-500 text-sm">votes:</span>{" "}
                                <span>{stream.upvotes}</span>
                              </p>
                            </div>
                            <div
                              onClick={() =>
                                handleVote(
                                  (stream._id ?? stream.id) as Id<"streams">,
                                  stream.hasUpvoted ? "downvote" : "upvote"
                                )
                              }
                              className="bg-zinc-800 hover:bg-purple-800 cursor-pointer px-3 py-3 flex items-center self-start gap-4 rounded-lg shadow-xl active:shadow-md active:shadow-purple-500/50 hover:shadow-purple-500/10  max-w-sm mx-auto transition-all duration-150 md:mx-4"
                            >
                              <ThumbsUp className="w-4 h-4 " fill={stream.hasUpvoted ? "white" : "transparent"} />
                            </div>
                          </motion.div>
                          {normalizedStreams.length > 1 && i == 0 && (
                            <div className="text-sm uppercase mt-4 text-zinc-500">Upcoming Song</div>
                          )}
                        </div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center flex-1 relative rounded-3xl overflow-hidden min-h-[60%] bg-gradient-to-br from-zinc-950 via-black to-zinc-900 border border-zinc-800 px-4 py-8">
                  <div className="absolute inset-0">
                    <div className="absolute -top-24 -left-16 h-64 w-64 bg-gradient-to-br from-purple-500/50 via-pink-500/30 to-orange-500/30 rounded-full blur-3xl opacity-70" />
                    <div className="absolute bottom-[-80px] left-1/4 h-72 w-72 bg-gradient-to-br from-blue-500/40 via-indigo-500/30 to-sky-500/20 rounded-full blur-3xl opacity-60" />
                    <div className="absolute -right-20 top-6 h-60 w-60 bg-gradient-to-br from-emerald-500/40 via-teal-500/30 to-cyan-500/20 rounded-full blur-3xl opacity-60" />
                  </div>
                  <BackgroundGradient
                    containerClassName="w-full max-w-lg mx-auto"
                    className="rounded-3xl bg-black/70 border border-white/10 p-8 shadow-2xl shadow-purple-500/20 backdrop-blur-xl"
                  >
                    <div className="relative aspect-square w-full rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 via-white/0 to-white/5 overflow-hidden mx-auto flex items-center justify-center px-8">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(255,114,255,0.08),transparent_40%)]" />
                      <div className="relative text-center space-y-4">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs tracking-[0.25em] text-purple-100 uppercase">
                          <IconSparkles className="h-4 w-4 text-amber-200" />
                          Queue
                        </div>
                        <p className="text-2xl font-semibold text-zinc-50 leading-tight">
                          Treat the room to a premium pick
                        </p>
                        <p className="text-sm text-zinc-400 max-w-sm mx-auto">
                          The queue is empty. Drop in a YouTube gem and set the vibe for everyone.
                        </p>
                        <div className="flex items-center justify-center gap-3 pt-2">
                          <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[11px] uppercase tracking-wide text-zinc-200">
                            Curated
                          </span>
                          <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[11px] uppercase tracking-wide text-zinc-200">
                            Ad-free zone
                          </span>
                          <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[11px] uppercase tracking-wide text-zinc-200">
                            Crowd pick
                          </span>
                        </div>
                      </div>
                    </div>
                  </BackgroundGradient>
                </div>
              )}

              <div className="flex-1 flex flex-col gap-y-8 backdrop-blur-3xl rounded-2xl">
                {/* current stream */}
                <div className="">
                  <div>
                    <div className="rounded-[10px] overflow-hidden mb-4">
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
                            onReady={(e) => {
                              const player = e.target;
                              playerRef.current = player;
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
                              },
                            }}
                            className="mx-auto rounded-2xl overflow-hidden"
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
                            <div className="text-zinc-500 text-sm uppercase">Next</div>
                            <IconArrowNarrowRightDashed className="w-14 h-14 hover:animate-pulse" />
                          </div>
                        )}
                      </div>
                    )}

                    {/* online users */}
                    {onlineUsers && onlineUsers.length > 0 && streamRoomDetails && (
                      <div className="mb-4 ml-2">
                        <div className="text-zinc-500 text-sm uppercase mb-2 mt-8">Online users</div>
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
            <div className="flex justify-center items-center relative h-[60vh] overflow-hidden rounded-2xl mx-auto bg-gradient-to-br from-zinc-950 via-black to-zinc-900 border border-zinc-800 p-6">
              {streamsLoading ? (
                <div className="text-center space-y-2">
                  <p className="text-lg font-bold text-zinc-200 uppercase">
                    <span className="text-[orangered]">Streams</span> Loading
                  </p>
                  <p className="text-sm text-zinc-400">Fetching the queue...</p>
                </div>
              ) : !thumbnail?.includes("null") ? (
                <div className="flex flex-col items-center gap-4 text-center max-w-md w-full">
                  <p className="text-sm font-bold text-zinc-200 uppercase">
                    Start Streaming - Add a YouTube song URL
                  </p>
                  {thumbnail && thumbnail !== "" && !thumbnail.includes("null") && (
                   <>
                    <Image
                      width={1080}
                      height={916}
                      className="rounded-xl mb-4 w-full h-full max-h-[260px] object-cover"
                      src={
                        thumbnail ??
                        "https://fastly.picsum.photos/id/237/200/300.jpg?hmac=TmmQSbShHz9CdQm0NkEjx1Dyh_Y984R9LpNrpvH2D_U"
                      }
                      alt=""
                      />
                      <button
                        className="p-3 rounded-xl bg-zinc-950 text-white text-lg font-bold flex gap-x-2 items-center justify-center hover:bg-amber-200 hover:text-black cursor-pointer border border-zinc-800 transition-colors"
                        onClick={handleSubmit}
                      >
                        <span className="text-sm font-bold uppercase">
                          Play Now
                        </span>
                        <IconArrowNarrowRightDashed className="w-8 h-8" />
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <div className="text-center space-y-3 max-w-lg">
                  <p className="text-lg font-bold text-zinc-200 w-full text-center uppercase">
                    Add <span className="text-[orangered]">Streams</span> start <span className="text-[orangered]">Streaming</span>
                  </p>
                  <p className="text-sm font-medium text-zinc-400">
                    No need to watch alone just join your favorite streams
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
