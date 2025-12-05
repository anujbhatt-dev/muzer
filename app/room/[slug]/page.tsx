"use client";
import { use } from "react";
import StreamsView from "@/app/components/StreamsView";

export default function RoomPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  return (
    <div className="mx-auto my-5 px-4 lg:px-0">
      <StreamsView roomSlug={slug} playVideo={false} />
    </div>
  );
}
