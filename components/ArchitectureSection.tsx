"use client";

import { motion } from "framer-motion";
import { BrainCircuit, Database, Globe, Leaf, Smartphone } from "lucide-react";
import { API_URL, GITHUB } from "@/lib/config";

const nodes = [
  { icon: Leaf, title: "Readings", text: "N, P, K, pH from a soil test; temperature, humidity and rainfall from sensors or weather data." },
  { icon: Database, title: "Firebase", text: "Auth and realtime storage for the mobile app: users, fields, sensor history." },
  { icon: BrainCircuit, title: "Model API", text: "FastAPI service running the Random Forest. Validates input and returns crop, confidence and a field check." },
  { icon: Smartphone, title: "Mobile app", text: "React Native (Expo). Dashboards, charts, and AI recommendations from the same API." },
  { icon: Globe, title: "This site", text: "Next.js on Vercel. The demo above calls the same public endpoint." },
];

export default function ArchitectureSection() {
  return (
    <section id="architecture" className="section-shell">
      <div className="section-inner">
        <p className="section-label">How it&apos;s built</p>
        <h2 className="section-title mt-4">One model, two front ends.</h2>
        <div className="mt-12 grid gap-4 md:grid-cols-5">
          {nodes.map(({ icon: Icon, title, text }, i) => (
            <motion.div
              key={title}
              className="card relative p-5"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              viewport={{ once: true }}
            >
              {i < nodes.length - 1 && <div className="absolute right-[-17px] top-1/2 hidden h-px w-4 bg-accent/40 md:block" />}
              <Icon className="mb-4 text-accent" size={22} />
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-textMuted">{text}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            ["Open API", <>Interactive docs at <a className="text-accent hover:underline" href={`${API_URL}/docs`} target="_blank" rel="noopener noreferrer">/docs</a>. Anyone can call it.</>],
            ["Reproducible", <>One script rebuilds the models and every number on this page. <a className="text-accent hover:underline" href={GITHUB.ml} target="_blank" rel="noopener noreferrer">See the code</a>.</>],
            ["Honest about scope", <>No field hardware is deployed yet. The app&apos;s sensor feed is simulated, while the model and API are live. Sensor integration is next.</>],
          ].map(([t, body]) => (
            <div key={t as string} className="rounded-lg border border-border bg-bg/50 p-5">
              <h4 className="font-semibold">{t}</h4>
              <p className="mt-2 text-sm leading-6 text-textMuted">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
