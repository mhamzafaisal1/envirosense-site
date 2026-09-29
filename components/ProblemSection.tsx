"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { DollarSign, Droplets, Thermometer } from "lucide-react";
import { useRef } from "react";

const cards = [
  { icon: Droplets, stat: "Guesswork", text: "Planting and fertilizer decisions on small farms are often made on habit, not measurements." },
  { icon: Thermometer, stat: "Variability", text: "Shifting rainfall and temperature make last season's choice a worse bet every year." },
  { icon: DollarSign, stat: "Cost", text: "Precision-agriculture platforms are priced for agribusiness, not the farms that need them most." }
];

export default function ProblemSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [30, -30]);

  return (
    <section ref={ref} className="section-shell fade-bottom">
      <div className="section-inner grid items-center gap-12 md:grid-cols-[1.2fr_0.8fr]">
        <motion.div style={{ y }} className="space-y-6">
          <motion.p className="section-label" initial={{ x: -20, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }}>The Problem</motion.p>
          <motion.h2 className="section-title" initial={{ x: -20, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }} viewport={{ once: true }}>Agriculture is flying blind.</motion.h2>
          <motion.p className="max-w-2xl text-lg leading-8 text-textMuted" initial={{ x: -20, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }} viewport={{ once: true }}>
            Climate variability, water waste, and the cost of modern precision tools leave small farms making critical decisions without data. The technology exists, but it was built for agribusiness, not the farmer who needs it.
          </motion.p>
          <motion.div className="h-[2px] bg-accent" initial={{ width: 0 }} whileInView={{ width: 60 }} transition={{ delay: 0.25 }} viewport={{ once: true }} />
        </motion.div>
        <div className="space-y-5">
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.stat}
                className="card border-l-4 border-l-accent p-6"
                initial={{ x: 28, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                whileHover={{ x: -4, boxShadow: "0 0 28px rgba(74,222,128,0.12)" }}
                transition={{ delay: 0.2 + index * 0.15 }}
                viewport={{ once: true }}
              >
                <Icon className="mb-4 text-accent" />
                <p className="font-mono text-3xl text-textPrimary">{card.stat}</p>
                <p className="mt-2 leading-7 text-textMuted">{card.text}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
