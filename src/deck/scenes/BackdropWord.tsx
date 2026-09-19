"use client";

import { motion } from "motion/react";
import { pick, sceneMove } from "../motion";
import type { Beat } from "../script";

export function BackdropWord({ beat }: { beat: Beat }) {
  const opacity = pick({ alone: 1, watched: 0.45 }, beat, 0);
  return (
    <motion.p
      className="type-display absolute inset-x-0 top-[120px] text-center text-backdrop text-ink-faint"
      initial={false}
      animate={{ opacity, y: opacity ? 0 : -40 }}
      transition={sceneMove}
      aria-hidden
    >
      Never alone
    </motion.p>
  );
}
