"use client";

import Redirect from "@/app/components/Redirect";
import GetStarted from "@/app/components/GetStarted";
import { spaceGrotesk } from "@/app/lib/fonts";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Clock3,
  Headphones,
  Music4,
  Radio,
  ShieldCheck,
  Sparkles,
  Users,
  Waves,
} from "lucide-react";

const highlights = [
  {
    icon: <Waves className="w-5 h-5" />,
    title: "Crowd-controlled playlists",
    copy: "Viewers add songs, vote in real time, and watch the queue evolve without breaking the vibe.",
  },
  {
    icon: <Radio className="w-5 h-5" />,
    title: "Creator-first controls",
    copy: "Lock in a theme, toggle slow/fast mode, and spotlight moments with cinematic transitions.",
  },
  {
    icon: <ShieldCheck className="w-5 h-5" />,
    title: "Latency tuned",
    copy: "Audio, reactions, and chat stay in sync so your community feels like they’re in the same room.",
  },
];

const steps = [
  { title: "Launch a room", detail: "Pick a vibe, drop your opener, and go live in under 60 seconds." },
  { title: "Let the crowd curate", detail: "Fans request tracks, upvote favorites, and shape the set list." },
  { title: "Keep them locked in", detail: "Alerts, chapter markers, and replays keep momentum between drops." },
];

const stats = [
  { label: "Rooms hosted", value: "12.4K" },
  { label: "Avg watch time", value: "47 min" },
  { label: "Crowd retention", value: "92%" },
];

export default function Landing() {
  return (
    <section
      className={`${spaceGrotesk.className} relative overflow-hidden text-[color:var(--text-primary)]`}
      style={{ background: "var(--bg)" }}
    >
      <Redirect />

      {/* Space gradient + starfield */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at 18% 18%, var(--accent-amber-soft), transparent 34%), radial-gradient(circle at 82% 12%, var(--accent-rose-soft), transparent 30%), radial-gradient(circle at 45% 82%, var(--accent-cyan-soft), transparent 36%)`,
          }}
        />
        <div className="absolute inset-0 opacity-30 mix-blend-screen" style={{ backgroundImage: "radial-gradient(2px 2px at 20% 30%, rgba(255,255,255,0.65), transparent), radial-gradient(2px 2px at 80% 10%, rgba(255,255,255,0.5), transparent), radial-gradient(1.5px 1.5px at 60% 70%, rgba(255,255,255,0.4), transparent)" }} />
        <motion.div
          aria-hidden
          className="absolute -left-16 top-6 h-64 w-64 rounded-full blur-[120px]"
          style={{ background: "var(--accent-amber-soft)" }}
          animate={{ y: [0, -10, 0], opacity: [0.45, 0.7, 0.45] }}
          transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="absolute right-0 bottom-10 h-80 w-80 rounded-full blur-[140px]"
          style={{ background: "var(--accent-rose-soft)" }}
          animate={{ y: [0, 14, 0], opacity: [0.35, 0.65, 0.35] }}
          transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }}
        />
      </div>

      <div className="relative max-w-6xl px-6 py-20 pt-40  mx-auto lg:px-10 lg:py-28">
        <div className="flex flex-col items-center gap-16 lg:flex-row lg:items-start">
          <motion.div
            className="w-full max-w-3xl space-y-7 text-center lg:text-left"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm uppercase tracking-[0.25em] backdrop-blur"
              style={{ background: "var(--pill)", color: "var(--accent-cyan)" }}
            >
              <Sparkles className="h-4 w-4" />
              Live social listening
            </div>
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl lg:leading-[1.05]">
              Host interstellar listening rooms that feel{" "}
              <span className="bg-gradient-to-r from-amber-200 via-rose-200 to-cyan-200 bg-clip-text text-transparent">
                alive in real time.
              </span>
            </h1>
            <p className="text-lg sm:text-xl leading-relaxed text-[color:var(--text-secondary)]">
              Naachogaao turns every drop into a shared moment - fans queue tracks, react in sync, and keep your set flowing with
              zero dead air.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 lg:justify-start">
              <SignedOut>
                <GetStarted classes="group text-lg font-semibold shadow-[0_18px_48px_rgba(251,191,36,0.28)] bg-gradient-to-r from-amber-400 via-rose-400 to-fuchsia-500 hover:from-amber-300 hover:via-rose-300 hover:to-fuchsia-400 cursor-pointer px-9 py-4 flex items-center gap-3 rounded-full active:shadow-md active:shadow-amber-400/30 hover:-translate-y-[2px] transition-all duration-150 justify-between backdrop-blur-lg" />
              </SignedOut>
              <SignedIn>
                <Link
                  href="/dashboard"
                  className="rounded-full px-7 py-3 text-base font-semibold shadow-lg backdrop-blur transition hover:-translate-y-[2px]"
                  style={{
                    borderColor: "var(--border-strong)",
                    background: "var(--card-strong)",
                    color: "var(--text-primary)",
                  }}
                >
                  Open dashboard
                </Link>
              </SignedIn>
              <Link
                href="#lineup"
                className="rounded-full border px-6 py-3 text-base font-medium transition hover:-translate-y-[2px]"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--accent-amber)",
                }}
              >
                See how it works
              </Link>
            </div>
            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
              {stats.map((stat) => (
                <motion.div
                  key={stat.label}
                  className="rounded-2xl px-5 py-6 text-left backdrop-blur"
                  whileHover={{ y: -4, borderColor: "rgba(251,191,36,0.35)" }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  style={{ background: "var(--card)", borderColor: "var(--border)" }}
                >
                  <div className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
                    {stat.value}
                  </div>
                  <div className="text-sm uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="relative w-full max-w-lg overflow-hidden rounded-3xl border p-7 shadow-2xl backdrop-blur"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: "easeOut", delay: 0.15 }}
          >
            <div className="flex items-center justify-between text-sm text-[color:var(--text-secondary)]">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Room is live
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                1.3k listeners
              </div>
            </div>

            <div
              className="mt-7 rounded-2xl border p-5"
              style={{ background: "var(--card-strong)", borderColor: "var(--border-strong)" }}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-cyan-400 to-emerald-300 text-slate-900 shadow-lg">
                  <Headphones className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-[color:var(--accent-cyan)]">Now playing</p>
                  <p className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
                    Orbiting Hearts — Live Cut
                  </p>
                </div>
              </div>
              <div className="mt-5 flex h-16 items-end gap-1">
                {Array.from({ length: 18 }).map((_, idx) => (
                  <motion.span
                    key={idx}
                    className="w-2 flex-1 rounded-full bg-gradient-to-t from-amber-300/70 via-rose-300 to-white"
                    animate={{ height: [`${8 + (idx % 5) * 6}px`, `${22 + (idx % 5) * 6}px`, `${12 + (idx % 5) * 6}px`] }}
                    transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut", delay: idx * 0.08 }}
                  />
                ))}
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3 text-sm text-[color:var(--text-secondary)]">
                <div className="flex items-center gap-2 rounded-xl border px-3 py-3" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                  <Music4 className="h-4 w-4 text-cyan-200" />
                  Crowd requests on
                </div>
                <div className="flex items-center gap-2 rounded-xl border px-3 py-3" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                  <Users className="h-4 w-4 text-cyan-200" />
                  Priority lane active
                </div>
                <div className="flex items-center gap-2 rounded-xl border px-3 py-3" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                  <Clock3 className="h-4 w-4 text-cyan-200" />
                  03:12 left in track
                </div>
                <div className="flex items-center gap-2 rounded-xl border px-3 py-3" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                  <ShieldCheck className="h-4 w-4 text-cyan-200" />
                  Sync shield on
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div id="lineup" className="mt-16 grid grid-cols-1 gap-7 lg:grid-cols-3">
          {highlights.map((item) => (
            <motion.div
              key={item.title}
              className="group relative overflow-hidden rounded-2xl p-6 backdrop-blur"
              whileHover={{ y: -6, borderColor: "rgba(251,191,36,0.32)", scale: 1.01 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              style={{ background: "var(--card)", borderColor: "var(--border)" }}
            >
              <div className="absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100 bg-gradient-to-br from-amber-400/12 via-rose-400/12 to-fuchsia-400/12" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-300/30 via-rose-300/30 to-fuchsia-400/30 text-amber-50 shadow-lg">
                {item.icon}
              </div>
              <h3 className="mt-4 text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[color:var(--text-secondary)]">{item.copy}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 grid grid-cols-1 gap-7 lg:grid-cols-2">
          <div
            className="rounded-2xl border p-7 backdrop-blur"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center gap-2 text-sm uppercase tracking-[0.24em] text-[color:var(--accent-cyan)]">
              <Sparkles className="h-4 w-4" />
              How it flows
            </div>
            <div className="mt-6 space-y-5">
              {steps.map((step, idx) => (
                <motion.div
                  key={step.title}
                  className="rounded-xl border p-5"
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.35, delay: idx * 0.05 }}
                  style={{ background: "var(--card)", borderColor: "var(--border)" }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500/40 to-indigo-500/30 text-white">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
                        {step.title}
                      </p>
                      <p className="text-sm text-[color:var(--text-secondary)]">{step.detail}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            className="relative overflow-hidden rounded-2xl border p-6 shadow-xl backdrop-blur"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 240, damping: 22 }}
          >
            <div className="absolute -left-12 top-10 h-24 w-24 rotate-12 rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="absolute -right-16 bottom-10 h-28 w-28 -rotate-6 rounded-full bg-amber-400/12 blur-3xl" />
            <div className="relative flex items-center gap-2 text-sm uppercase tracking-[0.24em] text-[color:var(--accent-cyan)]">
              <Radio className="h-4 w-4" />
              Stream toolkit
            </div>
            <div className="relative mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                { label: "Smart queue", desc: "Weighted voting keeps momentum steady." },
                { label: "Backstage mode", desc: "Prep the next drop without the crowd seeing." },
                { label: "Alerts + reactions", desc: "Sparks animate on beat to spotlight moments." },
                { label: "Replays", desc: "Save the set with chapters and crowd picks." },
              ].map((tool) => (
                <div
                  key={tool.label}
                  className="rounded-xl border p-4 text-sm"
                  style={{ background: "var(--card)", borderColor: "var(--border)" }}
                >
                  <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                    {tool.label}
                  </p>
                  <p className="mt-1 text-[color:var(--text-secondary)]">{tool.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
