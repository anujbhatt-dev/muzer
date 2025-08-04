"use client";
import React, { useEffect, useState } from "react";
import StreamsView from "./StreamsView";
import { motion, useAnimation } from "framer-motion";

export default function CreatorView({ creatorName }: { creatorName: string }) {
  const controls = useAnimation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 100;
      setScrolled(isScrolled);
      controls.start({
        scale: isScrolled ? 0.7 : 1,
        opacity: isScrolled ? 0 : 1,
        y: isScrolled ? -10 : 0,
        transition: { duration: 0.1, ease: "easeInOut" },
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [controls]);

  return (
    <div>
      <motion.div
        animate={controls}
        initial={{ scale: 1, opacity: 1, y: 0 }}
        className="text-xl font-bold lg:fixed lg:left-[50%] top-4 bg-zinc-900/10 backdrop-blur-3xl px-10 py-4 rounded-full lg:-translate-x-[50%] z-50 relative my-4 text-center overflow-hidden"
      >
        <span className="uppercase z-50">{creatorName}'s room</span>
      </motion.div>

      <StreamsView streamerName={creatorName} playVideo={false} />
    </div>
  );
}
