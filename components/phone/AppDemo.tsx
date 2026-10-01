"use client";

import { motion } from "framer-motion";
import DemoApp from "@/components/phone/DemoApp";
import PhoneFrame from "@/components/phone/PhoneFrame";

const TRY = [
  ["Read the field at a glance", "The summary line and sensor tiles update every few seconds."],
  ["Tap a sensor tile", "Opens its last 24 hours with the healthy band shaded."],
  ["Run the AI check", "Your inputs go to the live model on Render. Nothing here is canned."],
  ["Try “Dry spell”", "Watch the recommendation move from rice to a drought-tolerant pulse."],
];

export default function AppDemo() {
  return (
    <section id="app" className="section-shell bg-[radial-gradient(ellipse_at_70%_40%,rgba(74,222,128,0.08),transparent_60%)]">
      <div className="section-inner grid items-center gap-14 lg:grid-cols-[1fr_auto] lg:gap-20">
        <div className="max-w-xl">
          <h2 className="section-title">The app, running right here.</h2>
          <p className="mt-5 text-lg leading-8 text-textMuted">
            This is the EnviroSense mobile experience rebuilt for the browser: a demo farm with a simulated sensor feed and the real
            recommendation model behind the AI check. No download, no account.
          </p>

          <ol className="mt-10 hidden space-y-6 md:block">
            {TRY.map(([t, d], i) => (
              <li key={t} className="flex gap-4">
                <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-accent/40 font-mono text-xs text-accent">{i + 1}</span>
                <div>
                  <p className="font-semibold text-textPrimary">{t}</p>
                  <p className="mt-1 text-sm leading-6 text-textMuted">{d}</p>
                </div>
              </li>
            ))}
          </ol>

          <p className="mt-6 text-sm leading-6 text-textMuted md:hidden">Tap around: sensor tiles open their history, and the AI check calls the live model.</p>
          <p className="mt-10 hidden text-sm text-textMuted md:block">
            Built from the original React Native app. Sensor values are simulated; the model, its API and the field check are live.
          </p>
        </div>

        {/* Desktop: phone mockup */}
        <motion.div
          className="hidden md:block"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <PhoneFrame>
            <DemoApp />
          </PhoneFrame>
        </motion.div>

        {/* Phones: the app itself, full width, no frame */}
        <div className="md:hidden">
          <div className="mx-auto h-[720px] max-w-[420px] overflow-hidden rounded-[28px] border border-border">
            <DemoApp statusBar={false} />
          </div>
        </div>
      </div>
    </section>
  );
}
