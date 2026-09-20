"use client";

import { AnimatePresence, motion } from "motion/react";
import { pick, sceneMove } from "../motion";
import type { Beat } from "../script";

type Backdrop = { word: string; size: number; top: number };

// capOn clears the cap rather than sitting behind the head: at full backdrop
// size the head lands mid-word and reads as a collision, not as layering.
const words: Partial<Record<Beat, Backdrop>> = {
  capOn: { word: "Cloak", size: 210, top: 40 },
  humanFirst: { word: "Humans first", size: 400, top: 120 },
};

export function BackdropWord({ beat }: { beat: Beat }) {
  const opacity = pick({ capOn: 1, humanFirst: 1 }, beat, 0);
  const backdrop = words[beat];
  return (
    <AnimatePresence>
      {backdrop && <BackdropText key={backdrop.word} backdrop={backdrop} opacity={opacity} />}
    </AnimatePresence>
  );
}

function BackdropText({ backdrop, opacity }: { backdrop: Backdrop; opacity: number }) {
  return (
    <motion.p
      className="type-display absolute inset-x-0 text-center text-ink-faint"
      style={{ top: backdrop.top, fontSize: backdrop.size }}
      initial={{ opacity: 0, y: -40 }}
      animate={{ opacity, y: 0 }}
      exit={{ opacity: 0, y: -40 }}
      transition={sceneMove}
      aria-hidden
    >
      {backdrop.word}
    </motion.p>
  );
}
