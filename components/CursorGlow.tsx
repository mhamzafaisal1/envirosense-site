"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect } from "react";

export default function CursorGlow() {
  const x = useMotionValue(-400);
  const y = useMotionValue(-400);
  const smoothX = useSpring(x, { stiffness: 80, damping: 24 });
  const smoothY = useSpring(y, { stiffness: 80, damping: 24 });

  useEffect(() => {
    const move = (event: MouseEvent) => {
      x.set(event.clientX - 150);
      y.set(event.clientY - 150);
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [x, y]);

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed z-10 hidden h-[300px] w-[300px] rounded-full bg-[radial-gradient(circle,rgba(74,222,128,0.8),transparent_65%)] opacity-[0.04] md:block"
      style={{ x: smoothX, y: smoothY }}
    />
  );
}
