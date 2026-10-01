"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const links = [
  ["Try the app", "#app"],
  ["Model", "#demo"],
  ["Results", "#results"],
  ["How it's built", "#architecture"],
  ["Paper", "#paper"],
  ["About", "#about"]
];

function Logo() {
  return (
    <a href="#" className="flex items-center gap-3">
      <svg className="h-8 w-8" viewBox="0 0 40 40" fill="none" aria-hidden>
        <circle cx="20" cy="20" r="18" stroke="#4ade80" strokeWidth="2" />
        <path d="M14 24c10-17 20-13 22-13-1 12-9 19-18 18-3 0-5-1-7-3 6-1 12-5 17-12-7 6-12 8-14 10Z" fill="#4ade80" />
      </svg>
      <span className="text-lg font-semibold text-textPrimary">EnviroSense</span>
    </a>
  );
}

export default function Navbar() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", latest => setScrolled(latest > 80));

  return (
    <motion.nav
      className="fixed left-0 right-0 top-0 z-50"
      animate={{
        backgroundColor: scrolled ? "rgba(10,15,13,0.95)" : "rgba(10,15,13,0)",
        borderBottomColor: scrolled ? "#1f3323" : "rgba(31,51,35,0)"
      }}
      transition={{ duration: 0.25 }}
      style={{ borderBottom: "1px solid transparent", backdropFilter: scrolled ? "blur(18px)" : "none" }}
    >
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-6">
        <Logo />
        <div className="hidden items-center gap-8 md:flex">
          {links.map(([label, href]) => (
            <a key={label} href={href} className="nav-link">
              {label}
            </a>
          ))}
        </div>
        <a
          href="#app"
          className="hidden rounded-lg border border-accent px-5 py-2 text-sm font-semibold text-accent transition hover:bg-accent hover:text-bg md:block"
        >
          Try it
        </a>
        <button
          className="grid h-10 w-10 place-items-center rounded-lg border border-border text-accent md:hidden"
          onClick={() => setOpen(value => !value)}
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            className="overflow-hidden border-t border-border bg-bg/95 md:hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <div className="flex flex-col px-6 py-4">
              {links.map(([label, href]) => (
                <a key={label} href={href} onClick={() => setOpen(false)} className="py-4 text-textMuted">
                  {label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
