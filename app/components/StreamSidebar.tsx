"use client";
import { useEffect, useState, type CSSProperties, type ElementType } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  IconHome2,
  IconLoader2,
  IconMenu2,
  IconX,
} from "@tabler/icons-react";
import { useAuth, useClerk } from "@clerk/nextjs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type RoomItem = { slug: string; name: string; owned?: boolean };

type StreamSidebarProps = {
  activeSlug?: string | null;
  onRoomSelect?: (slug: string) => void;
};

const surface: CSSProperties = { background: "var(--card)", borderColor: "var(--border)" };
const surfaceStrong: CSSProperties = { background: "var(--card-strong)", borderColor: "var(--border-strong)" };
const pillStyle: CSSProperties = { background: "var(--pill)", color: "var(--text-secondary)" };
const textSecondary = "text-[color:var(--text-secondary)]";
const textPrimary = "text-[color:var(--text-primary)]";

export function StreamSidebar({ activeSlug, onRoomSelect }: StreamSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { signOut } = useClerk();
  const { isSignedIn, isLoaded, userId } = useAuth();

  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [creating, setCreating] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const isOwnerOfAnyRoom = rooms.some((room) => room.owned);
  const isOnDashboard = pathname === "/dashboard";
  const isOnRoomPage = pathname?.includes("/room/");
  const closeMobileMenu = () => setMobileOpen(false);

  useEffect(() => {
    const fetchRooms = async () => {
      if (!userId) return;
      try {
        setLoadingRooms(true);
        const res = await fetch(`/api/rooms?userId=${userId}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.message || "Failed to load rooms");
        }
        const owned =
          (data?.owned ?? []).map((r: any) => ({
            slug: r.slug,
            name: r.name,
            owned: true,
          })) || [];
        const member =
          (data?.memberRooms ?? []).map((r: any) => ({
            slug: r.slug,
            name: r.name,
            owned: false,
          })) || [];
        setRooms([...owned, ...member]);
      } catch (error) {
        console.error(error);
        toast.error("Unable to fetch rooms");
      } finally {
        setLoadingRooms(false);
      }
    };
    fetchRooms();
  }, [userId]);

  async function handleCreateRoom() {
    if (!userId) {
      toast.error("Sign in to create a room");
      return;
    }
    if (!roomName.trim()) {
      toast.error("Room name required");
      return;
    }
    try {
      setCreating(true);
      const res = await fetch("/api/rooms", {
        method: "POST",
        body: JSON.stringify({ ownerId: userId, name: roomName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Failed to create room");
      }
      const newRoom: RoomItem = {
        slug: data.room.slug,
        name: data.room.name,
        owned: true,
      };
      setRooms((prev) => [newRoom, ...prev]);
      setRoomName("");
      if (onRoomSelect) {
        onRoomSelect(newRoom.slug);
      } else {
        router.push(`/room/${newRoom.slug}`);
      }
      toast.success("Room created");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Failed to create room");
    } finally {
      setCreating(false);
    }
  }

  const handleNavigate = (href?: string, action?: () => Promise<void> | void) => {
    if (action) {
      action();
      closeMobileMenu();
      return;
    }
    if (href) {
      closeMobileMenu();
      router.push(href);
    }
  };

  const currentSlug =
  activeSlug ?? (pathname?.startsWith("/room/") ? pathname.split("/room/")[1] : null);
  if (!isLoaded || !isSignedIn) return null;

  const handleRoomClick = (slug: string) => {
    if (onRoomSelect) {
      onRoomSelect(slug);
    } else {
      router.push(`/room/${slug}`);
    }
    closeMobileMenu();
  };

  const sidebarContent = (
    <div className="flex w-full flex-col gap-4">
      <div className={`flex items-center justify-between text-xs uppercase tracking-[0.15em] ${textSecondary}`}>
        <span>Navigation</span>
        <span className="rounded-full px-2 py-0.5 text-[10px]" style={{ ...pillStyle, color: "var(--accent-rose)" }}>
          Live
        </span>
      </div>

      <button
        type="button"
        onClick={() => handleNavigate("/dashboard")}
        className={cn(
          `flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-semibold transition ${textPrimary}`,
          isOnDashboard ? "shadow-[0_12px_30px_rgba(0,0,0,0.08)]" : "hover:-translate-y-[1px]"
        )}
        style={isOnDashboard ? { ...surfaceStrong, boxShadow: "0 18px 42px rgba(0,0,0,0.08)" } : surface}
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-lg ring-1" style={{ ...surfaceStrong, borderColor: "var(--border-strong)" }}>
          <IconHome2 className="h-5 w-5" />
        </span>
        <div className="flex-1">
          <p>Dashboard</p>
          <p className={`text-xs ${textSecondary}`}>Manage your rooms</p>
        </div>
      </button>

      {!isOnRoomPage && (isOnDashboard || isOwnerOfAnyRoom) && (
        <div className="mt-2 rounded-xl border p-3 shadow-inner" style={{ ...surface, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.02)" }}>
          <div className={`text-xs uppercase tracking-[0.15em] ${textSecondary} mb-2`}>New room</div>
          <div className="flex flex-col gap-2">
            <input
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Room name"
              className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:border-[color:var(--accent-rose)] ${textPrimary}`}
              style={surface}
            />
            <button
              type="button"
              onClick={handleCreateRoom}
              disabled={creating}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[color:var(--accent-amber)]/80 via-[color:var(--accent-rose)]/80 to-[color:var(--accent-cyan)]/80 px-3 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
            >
              {creating && <IconLoader2 className="h-4 w-4 animate-spin" />}
              {creating ? "Creating..." : "Create room"}
            </button>
          </div>
        </div>
      )}

      <div className="rounded-xl border p-3 shadow-inner" style={{ ...surface, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.02)" }}>
        <div className={`flex items-center justify-between text-xs uppercase tracking-[0.15em] ${textSecondary} mb-2`}>
          <span>Your rooms</span>
          {loadingRooms && <IconLoader2 className={`h-4 w-4 animate-spin ${textSecondary}`} />}
        </div>
        {rooms.length === 0 && !loadingRooms ? (
          <p className={`text-xs ${textSecondary}`}>No rooms yet. Create one to get started.</p>
        ) : (
          <div className="space-y-2 overflow-auto pr-1 custom-scrollbar">
            {rooms.map((room) => (
              <button
                key={room.slug}
                onClick={() => handleRoomClick(room.slug)}
                className={cn(
                  `w-full rounded-lg border px-3 py-2 text-left text-sm transition ${textPrimary}`,
                  currentSlug === room.slug
                    ? "shadow-[0_10px_25px_rgba(0,0,0,0.08)]"
                    : "hover:-translate-y-[1px]"
                )}
                style={
                  currentSlug === room.slug
                    ? { ...surfaceStrong, borderColor: "var(--accent-rose)" }
                    : surface
                }
                type="button"
              >
                <div className="flex items-center justify-between">
                  <span>{room.name}</span>
                  {room.owned && (
                    <span className="text-[10px] uppercase tracking-[0.15em]" style={{ color: "var(--accent-rose)" }}>
                      Owner
                    </span>
                  )}
                </div>
                <p className={`text-[11px] ${textSecondary}`}>/room/{room.slug}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed bottom-6 right-4 z-50 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-900/30 backdrop-blur-lg"
        style={{
          borderColor: "var(--border-strong)",
          background: "linear-gradient(120deg, var(--accent-amber), var(--accent-rose), var(--accent-cyan))",
        }}
      >
        <IconMenu2 className="h-5 w-5" />
        Rooms
      </button>

      <div
        className={cn(
          "lg:hidden fixed inset-0 z-60 transition-all duration-200 ease-out",
          mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
      >
        <div
          className="absolute inset-0 backdrop-blur-sm"
          style={{ background: "rgba(0,0,0,0.55)" }}
          onClick={closeMobileMenu}
        />
        <div
          className={cn(
            "absolute inset-0 px-4 py-5 ",
            mobileOpen ? "translate-y-0" : "translate-y-4"
          )}
        >
          <div className="relative h-full w-full">
            <button
              type="button"
              onClick={closeMobileMenu}
              className="h-[5vh] aspect-square flex justify-center items-center ml-auto mb-4 z-10 rounded-full border p-2 text-white shadow-lg backdrop-blur"
              style={{ ...surfaceStrong, background: "var(--panel-strong)" }}
            >
              <IconX className="h-5 w-5" />
            </button>
            <div
              className="h-[90vh] overflow-y-auto rounded-2xl border p-4 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.38)] backdrop-blur-2xl"
              style={{ background: "var(--panel)", borderColor: "var(--border)" }}
            >
              {sidebarContent}
            </div>
          </div>
        </div>
      </div>

      <aside
        className="hidden lg:flex w-72 shrink-0 flex-col gap-4 rounded-2xl border p-4 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.18)] backdrop-blur-2xl sticky top-5 self-start"
        style={{ background: "var(--panel)", borderColor: "var(--border)" }}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
