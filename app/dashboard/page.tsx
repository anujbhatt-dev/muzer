"use client"
import StreamsView from "../components/StreamsView";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const { userId } = useAuth();
  const [rooms, setRooms] = useState<{ slug: string; name: string; owned: boolean }[]>([]);
  const [selectedRoomSlug, setSelectedRoomSlug] = useState<string | null>(null);
  const [roomNameInput, setRoomNameInput] = useState("");
  const [creatingRoom, setCreatingRoom] = useState(false);
  const hasRooms = rooms.length > 0;

  useEffect(() => {
    const fetchRooms = async () => {
      if (!userId) return;
      try {
        const res = await fetch(`/api/rooms?userId=${userId}`);
        const data = await res.json();
        const owned = (data?.owned ?? []).map((r: any) => ({
          slug: r.slug,
          name: r.name,
          owned: true,
        }));
        const memberRooms = (data?.memberRooms ?? []).map((r: any) => ({
          slug: r.slug,
          name: r.name,
          owned: false,
        }));
        const allRoomsForUser = [...owned, ...memberRooms];
        setRooms(allRoomsForUser);
        if (!selectedRoomSlug && allRoomsForUser.length) {
          setSelectedRoomSlug(allRoomsForUser[0].slug);
        }
      } catch (error) {
        console.log("error fetching rooms " + error);
      }
    };
    fetchRooms();
  }, [userId, selectedRoomSlug]);

  const handleCreateRoom = async () => {
    if (!userId) {
      toast.error("Sign in to create a room");
      return;
    }
    if (!roomNameInput.trim()) {
      toast.error("Room name required");
      return;
    }
    try {
      setCreatingRoom(true);
      const res = await fetch("/api/rooms", {
        method: "POST",
        body: JSON.stringify({
          ownerId: userId,
          name: roomNameInput.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.message || "Failed to create room");
        return;
      }
      const newRoom = { slug: data.room.slug, name: data.room.name, owned: true };
      setRooms((prev) => [newRoom, ...prev]);
      setSelectedRoomSlug(newRoom.slug);
      setRoomNameInput("");
      toast.success("Room created");
    } catch (error) {
      toast.error("Failed to create room");
    } finally {
      setCreatingRoom(false);
    }
  };


  return (
    <div className="relative mt-5 px-4 lg:px-0">

      {selectedRoomSlug ? (
        <StreamsView
          roomSlug={selectedRoomSlug}
          playVideo={rooms.find((r) => r.slug === selectedRoomSlug)?.owned ?? false}
          onRoomSelect={(slug) => setSelectedRoomSlug(slug)}
        />
      ) : (
        <div className="relative min-h-[70vh] flex items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-950 via-black to-zinc-900 shadow-2xl shadow-purple-900/10 px-6 py-12 sm:px-10 max-w-6xl mx-auto">
          <div className="pointer-events-none absolute -top-16 -left-10 h-64 w-64 rounded-full bg-gradient-to-br from-purple-500/40 via-pink-500/30 to-orange-400/20 blur-3xl opacity-70" />
          <div className="pointer-events-none absolute -bottom-20 right-0 h-72 w-72 rounded-full bg-gradient-to-br from-sky-500/30 via-blue-500/20 to-indigo-500/20 blur-3xl opacity-60" />

          <div className="relative w-full max-w-3xl text-center space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-purple-100">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              {hasRooms ? "Choose a room to jump in" : "No rooms yet"}
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-50">Launch your first room</h2>
              <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto">
                Name your space, invite friends, and start sharing streams together. You can always join other rooms later.
              </p>
            </div>

            <div className="mx-auto flex w-full max-w-2xl flex-col gap-3 sm:flex-row sm:items-center sm:gap-2">
              <input
                value={roomNameInput}
                onChange={(e) => setRoomNameInput(e.target.value)}
                placeholder="Give your room a name (e.g. Friday Night Mix)"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/40"
                disabled={creatingRoom}
              />
              <button
                onClick={handleCreateRoom}
                disabled={creatingRoom}
                className="whitespace-nowrap rounded-2xl bg-gradient-to-r from-purple-500 via-fuchsia-500 to-orange-400 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/30 transition hover:shadow-purple-400/40 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {creatingRoom ? "Creating..." : "Create room"}
              </button>
            </div>

            <p className="text-xs text-zinc-500">
              Tip: rooms you own appear first and are auto-selected after creation.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
