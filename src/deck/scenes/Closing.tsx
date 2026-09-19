"use client";

import { AnimatePresence, motion } from "motion/react";
import { quickFade, sceneEase, sceneMove } from "../motion";
import { Cap } from "../parts/Cap";
import { CountUp } from "../parts/CountUp";
import { SourceStack, type SourceBlock } from "../parts/SourceStack";
import type { Beat } from "../script";
import { sources } from "../sources";

const beatSources: Partial<Record<Beat, SourceBlock>> = {
  flock: { list: [sources.flockAgencies, sources.flockStates], left: 100, width: 1720 },
};

export function TakeHome({ beat }: { beat: Beat }) {
  const visible = beat === "takeHome";
  return (
    <div className="pointer-events-none absolute inset-0">
      <motion.div
        className="absolute left-[510px] top-[150px] w-[900px]"
        initial={false}
        animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : -120, rotate: visible ? -4 : -12 }}
        transition={{ ...sceneMove, delay: visible ? 0.3 : 0 }}
      >
        <motion.div
          animate={visible ? { y: [0, -14, 0] } : { y: 0 }}
          transition={{ duration: 3.2, ease: "easeInOut", repeat: Infinity }}
        >
          <Cap cropped glowing className="w-full" />
        </motion.div>
      </motion.div>
      <motion.div
        className="absolute left-[610px] top-[790px] h-10 w-[700px] rounded-[50%]"
        style={{ background: "radial-gradient(closest-side, oklch(0 0 0 / 0.7), transparent)" }}
        initial={false}
        animate={{ opacity: visible ? 1 : 0 }}
        transition={sceneMove}
      />
      <motion.h2
        className="type-display absolute inset-x-0 top-[860px] text-center text-[120px] text-ink"
        initial={false}
        animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 24 }}
        transition={{ ...sceneMove, delay: visible ? 0.8 : 0 }}
      >
        Take a Cloak model home
      </motion.h2>
    </div>
  );
}

const flockStats = [
  { value: 5000, suffix: "+", label: "law enforcement agencies have chosen Flock, by the company’s count" },
  { value: 49, suffix: "", label: "states are connected through Flock’s license plate reader network" },
];

export function Closing({ beat }: { beat: Beat }) {
  return (
    <div className="pointer-events-none absolute inset-0">
      <AnimatePresence>
        {beat === "flock" && (
          <motion.div
            key="flock"
            className="absolute inset-x-[100px] top-[80px] flex gap-24"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12, transition: quickFade }}
            transition={{ ...quickFade, delay: 0.3 }}
          >
            {flockStats.map((stat) => (
              <div key={stat.label} className="w-[640px]">
                <p className="type-display text-[160px] text-ink">
                  <CountUp value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="type-label mt-3 text-[34px] text-ink-muted" style={{ textWrap: "balance" }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <motion.h2
        className="type-display absolute inset-x-0 top-[70px] text-center text-[260px] text-ink"
        initial={false}
        animate={{ opacity: beat === "together" ? 1 : 0, y: beat === "together" ? 0 : -30 }}
        transition={{ duration: 1.1, ease: sceneEase, delay: beat === "together" ? 2.2 : 0 }}
      >
        Cloak
      </motion.h2>
      <SourceStack beat={beat} blocks={beatSources} />
    </div>
  );
}
