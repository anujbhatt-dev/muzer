"use client";

import { SignedIn, SignedOut, SignInButton, UserButton, useClerk } from "@clerk/clerk-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LogIn, LogOut, Menu, Moon, SunMedium, X } from "lucide-react";

export default function Appbar() {
  const { signOut } = useClerk();
  const [visible, setVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [menuOpen, setMenuOpen] = useState(false);

  const applyTheme = useCallback((value: "dark" | "light") => {
    setTheme(value);
    if (typeof document !== "undefined") {
      document.documentElement.dataset.theme = value;
      document.body?.setAttribute("data-theme", value);
      localStorage.setItem("theme", value);
    }
  }, []);

  useEffect(() => {
    let lastY = window.scrollY;
    const handleScroll = () => {
      const currentY = window.scrollY;
      setScrolled(currentY > 10);

      const delta = currentY - lastY;
      const threshold = 8;
      if (Math.abs(delta) > threshold) {
        setVisible(delta < 0 || currentY < 40);
        lastY = currentY;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    const stored = localStorage.getItem("theme") as "dark" | "light" | null;
    const prefersLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
    applyTheme(stored ?? (prefersLight ? "light" : "dark"));

    return () => window.removeEventListener("scroll", handleScroll);
  }, [applyTheme]);

  useEffect(() => {
    const closeOnResize = () => {
      if (window.innerWidth >= 768) {
        setMenuOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    window.addEventListener("resize", closeOnResize);
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      window.removeEventListener("resize", closeOnResize);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return (
    <motion.header
      initial={{ y: 0 }}
      animate={{ y: visible ? 0 : -110 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="mx-auto inset-x-0 top-0 z-50 flex justify-center pointer-events-none"
    >
      <div
        className="pointer-events-auto relative flex w-full items-center justify-between gap-3 border-b px-5 py-3 sm:px-6 sm:py-4 transition-all duration-300 backdrop-blur"
        style={{
          background: scrolled ? "var(--panel-strong)" : "var(--panel)",
          borderColor: scrolled ? "var(--border-strong)" : "var(--border)",
          color: "var(--text-primary)",
          boxShadow: scrolled ? "0 18px 32px rgba(0,0,0,0.15)" : undefined,
        }}
      >
        <Link href="/" className="flex items-center gap-3 text-base font-semibold tracking-[0.16em] sm:text-lg sm:tracking-[0.18em]">
          <span className="rounded-full bg-gradient-to-r from-amber-400 via-rose-300 to-fuchsia-400 px-3 py-1 text-xs sm:text-sm text-zinc-950 shadow-lg shadow-amber-500/20">
            NAACHOGAAO
          </span>
          <span className="hidden text-[color:var(--text-secondary)] sm:inline">Live Rooms</span>
        </Link>

        <div className="hidden items-center gap-3 md:flex">
          <button
            onClick={() => applyTheme(theme === "dark" ? "light" : "dark")}
            className="flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition hover:-translate-y-[1px]"
            style={{
              borderColor: "var(--border)",
              color: "var(--text-secondary)",
              background: "var(--pill)",
            }}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <SunMedium className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            <span className="hidden sm:inline">{theme === "dark" ? "Light" : "Dark"} mode</span>
          </button>

          <SignedIn>
            <UserButton />
            <button
              onClick={() => signOut()}
              className="group flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition hover:-translate-y-[1px]"
              style={{
                borderColor: "var(--border)",
                color: "var(--text-secondary)",
              }}
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </SignedIn>

          <SignedOut>
            <SignInButton forceRedirectUrl="/dashboard" mode="modal">
              <button className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 via-rose-400 to-fuchsia-500 px-5 py-2 text-sm font-semibold text-zinc-950 shadow-[0_14px_40px_rgba(251,191,36,0.28)] transition hover:-translate-y-[1px] hover:from-amber-300 hover:via-rose-300 hover:to-fuchsia-400">
                <LogIn className="h-4 w-4" />
                <span>Join in</span>
              </button>
            </SignInButton>
          </SignedOut>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => applyTheme(theme === "dark" ? "light" : "dark")}
            className="flex items-center gap-1 rounded-full border px-3 py-2 text-sm font-semibold transition hover:-translate-y-[1px]"
            style={{
              borderColor: "var(--border)",
              color: "var(--text-secondary)",
              background: "var(--pill)",
            }}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <SunMedium className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-expanded={menuOpen}
            aria-label="Toggle navigation menu"
            className="flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition hover:-translate-y-[1px]"
            style={{
              borderColor: "var(--border)",
              color: "var(--text-primary)",
              background: "var(--panel)",
            }}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute right-3 top-[calc(100%+0.75rem)] w-full min-w-[260px] max-w-sm rounded-2xl border p-4 shadow-2xl backdrop-blur md:hidden"
            style={{ background: "var(--panel-strong)", borderColor: "var(--border-strong)" }}
          >
            <div className="flex items-center justify-between gap-2 pb-3 border-b" style={{ borderColor: "var(--border)" }}>
              <div className="text-sm font-semibold text-[color:var(--text-primary)]">Quick actions</div>
              <Link href="/" onClick={() => setMenuOpen(false)} className="text-xs uppercase tracking-[0.16em] text-[color:var(--text-secondary)]">
                Home
              </Link>
            </div>
            <div className="mt-3 grid gap-3">
              <SignedIn>
                <div className="flex items-center justify-between rounded-xl border px-3 py-2" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
                  <span className="text-sm font-semibold text-[color:var(--text-primary)]">Account</span>
                  <UserButton afterSignOutUrl="/" />
                </div>
                <Link
                  href="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition hover:-translate-y-[1px]"
                  style={{ borderColor: "var(--border)", color: "var(--text-primary)", background: "var(--pill)" }}
                >
                  Go to dashboard
                </Link>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    signOut();
                  }}
                  className="flex items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition hover:-translate-y-[1px]"
                  style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </SignedIn>

              <SignedOut>
                <SignInButton forceRedirectUrl="/dashboard" mode="modal">
                  <button className="group flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-400 via-rose-400 to-fuchsia-500 px-5 py-3 text-sm font-semibold text-zinc-950 shadow-[0_14px_40px_rgba(251,191,36,0.28)] transition hover:-translate-y-[1px] hover:from-amber-300 hover:via-rose-300 hover:to-fuchsia-400">
                    <LogIn className="h-4 w-4" />
                    Join in
                  </button>
                </SignInButton>
              </SignedOut>
            </div>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
}
