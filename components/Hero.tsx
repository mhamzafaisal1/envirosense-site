"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import StatusDot from "@/components/StatusDot";
import { useApiStatus } from "@/hooks/useApiStatus";
import metrics from "@/lib/metrics.json";
import { APP_URL } from "@/lib/config";

const HeroScene = dynamic(() => import("@/components/three/HeroScene"), { ssr: false });

const acc = (Math.round(metrics.models.random_forest.test_accuracy * 1000) / 10).toString();
const pills = [`${acc}% hold-out accuracy`, `${metrics.dataset.classes} crops`, "Open source", "FastAPI · Next.js · Expo"];

const tickerItems = [
  `Random Forest · ${acc}% on held-out data`,
  `${metrics.dataset.rows.toLocaleString()} real soil & climate samples`,
  "Nitrogen · Phosphorus · Potassium · pH",
  "Temperature · Humidity · Rainfall",
  "Public REST API with OpenAPI docs",
  "Mobile app on Expo + Firebase",
  "Reproducible training pipeline",
];

export default function Hero() {
  const status = useApiStatus();
  // Duplicate for seamless loop
  const ticker = [...tickerItems, ...tickerItems];

  return (
    <section id="overview" className="fade-bottom relative grid min-h-screen place-items-center overflow-hidden px-6 pt-20">
      <HeroScene />
      <div className="absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,rgba(74,222,128,0.05),transparent_60%)]" />

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center">
        <motion.div
          className="mb-6 inline-flex items-center gap-3 rounded-full border border-border bg-surface px-4 py-2 text-sm text-textMuted"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <StatusDot status={status} />
          <span className="text-border">|</span>
          Research project · Valparaiso University
        </motion.div>

        <motion.h1
          className="text-balance text-[clamp(3rem,7vw,5.5rem)] font-bold leading-[0.98] text-textPrimary"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          Know what your soil
          <br />
          <span className="text-accent [text-shadow:0_0_32px_rgba(74,222,128,0.5)]">wants to grow.</span>
        </motion.h1>

        <motion.p
          className="mt-7 max-w-2xl text-lg leading-8 text-textMuted md:text-xl"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          EnviroSense turns a basic soil test and local weather into a crop recommendation, with a
          clear breakdown of what to fix. It started as a research paper; now it&apos;s a live model you can try.
        </motion.p>

        <motion.div
          className="mt-9 flex flex-col gap-4 sm:flex-row"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <motion.a
            whileHover={{ scale: 1.04, boxShadow: "0 0 28px rgba(74,222,128,0.45)" }}
            href="#demo"
            className="rounded-lg bg-accent px-8 py-4 font-semibold text-bg"
          >
            Try the live model
          </motion.a>
          <motion.a
            whileHover={{ scale: 1.04, backgroundColor: "rgba(74,222,128,0.08)" }}
            href={APP_URL || "#paper"}
            className="rounded-lg border border-accent px-8 py-4 font-semibold text-accent"
          >
            {APP_URL ? "Open the app" : "Read the paper"}
          </motion.a>
        </motion.div>

        {/* Staggered pills */}
        <motion.div
          className="mt-9 flex flex-wrap justify-center gap-3"
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.1, delayChildren: 1 } } }}
        >
          {pills.map(pill => (
            <motion.span
              key={pill}
              variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
              className="rounded-full border border-accent/20 bg-accent/10 px-4 py-2 font-mono text-xs text-accent"
            >
              {pill}
            </motion.span>
          ))}
        </motion.div>

        {/* Stats ticker */}
        <motion.div
          className="mt-10 w-full max-w-2xl overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
        >
          <div className="relative">
            {/* Fade masks on edges */}
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-[linear-gradient(to_right,#0a0f0d,transparent)]" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-[linear-gradient(to_left,#0a0f0d,transparent)]" />
            <motion.div
              className="flex gap-8 whitespace-nowrap"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
            >
              {ticker.map((item, i) => (
                <span key={i} className="inline-flex items-center gap-3 font-mono text-[11px] text-textMuted/60">
                  <span className="h-1 w-1 rounded-full bg-accent/40" />
                  {item}
                </span>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-center font-mono text-xs text-textMuted">
        <div className="relative mx-auto mb-2 h-10 w-[2px] bg-accent/60">
          <motion.div
            className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 rounded-full bg-accent"
            animate={{ y: [0, 28, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>
        scroll
      </div>
    </section>
  );
}
