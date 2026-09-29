"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, Mail } from "lucide-react";
import { useState } from "react";
import { CONTACT_EMAIL } from "@/lib/config";

const authors = [
  {
    initials: "HF",
    name: "Muhammad Hamza Faisal",
    bio: "Research focused on AI, IoT, and edge computing for real-world agricultural impact.",
    linkedin: "https://www.linkedin.com/in/muhammad-hamza-faisal/",
    email: CONTACT_EMAIL,
  },
  {
    initials: "HC",
    name: "Haydar Cukurtepe",
    bio: "Co-researcher and collaborator on the EnviroSense system design and implementation.",
    linkedin: "https://www.linkedin.com/in/haydarcukurtepe/",
    email: "haydar.cukurtepe@valpo.edu",
  },
];

const phases = [
  ["2024", "Research & design", "Defined the problem for small farms, designed the sensor-to-app architecture, and reviewed prior AI/IoT work."],
  ["2024", "Prototype & paper", "Built the React Native app with Firebase auth and dashboards, trained the first models, and wrote the paper."],
  ["2026", "Re-audit", "Re-evaluated the models against real data, replaced synthetic targets, and published a reproducible pipeline."],
  ["2026", "Live", "Deployed the model as a public API, wired it into the app, and shipped this site with a live demo."]
];

export default function AboutSection() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section id="about" className="section-shell">
      <div className="section-inner text-center">
        <h2 className="mx-auto max-w-4xl text-[clamp(2rem,5vw,4rem)] font-bold leading-tight">Started as research at Valparaiso University. Now it runs.</h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-textMuted">Built to bridge the gap between precision agriculture technology and the farms that need it most.</p>
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {authors.map(({ initials, name, bio, linkedin, email }) => (
            <div key={name} className="card p-8 text-left">
              <div className="mb-5 grid h-16 w-16 place-items-center rounded-full bg-[linear-gradient(145deg,#183321,#0c1710)] text-2xl font-bold text-accent">{initials}</div>
              <h3 className="text-xl font-bold">{name}</h3>
              <p className="mt-1 text-sm text-textMuted">Computer Science · Valparaiso University</p>
              <p className="mt-4 leading-7 text-textMuted">{bio}</p>
              <div className="mt-5 flex gap-4 text-textMuted">
                <a href={linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-accent" aria-label="LinkedIn"><ExternalLink size={19} /></a>
                <a href={`mailto:${email}`} className="hover:text-accent" aria-label="Email"><Mail size={19} /></a>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-16 grid gap-8 md:grid-cols-4 md:gap-0">
          {phases.map(([phase, title, description], index) => (
            <div key={phase} className="relative flex flex-col items-center" onMouseEnter={() => setHovered(index)} onMouseLeave={() => setHovered(null)}>
              {index < phases.length - 1 && <div className="absolute left-1/2 top-3 hidden h-px w-full bg-border md:block" />}
              <div className="relative z-10 h-6 w-6 rounded-full bg-accent">
                <span className="absolute inset-0 rounded-full bg-accent/40 animate-ping" />
              </div>
              <p className="mt-4 font-mono text-xs text-accent">{phase}</p>
              <p className="mt-1 font-semibold">{title}</p>
              <AnimatePresence>
                {hovered === index && (
                  <motion.div className="absolute bottom-full z-20 mb-4 w-64 rounded-lg border border-border bg-surface p-4 text-left text-sm leading-6 text-textMuted shadow-2xl" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
                    {description}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
        <p className="mt-16 text-sm text-textMuted">Muhammad Hamza Faisal & Haydar Cukurtepe · Valparaiso University · Valparaiso, IN, USA</p>
      </div>
    </section>
  );
}
