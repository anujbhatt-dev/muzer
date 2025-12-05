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
        const allRooms = [...owned, ...memberRooms];
        setRooms(allRooms);
        if (!selectedRoomSlug && allRooms.length) {
          setSelectedRoomSlug(allRooms[0].slug);
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
        <div className="text-sm text-zinc-500">Create or join a room to start streaming.</div>
      )}
    </div>
  );
}
