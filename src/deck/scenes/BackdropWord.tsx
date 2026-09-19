"use client";

import { AnimatePresence, motion } from "motion/react";
import { pick, sceneMove } from "../motion";
import type { Beat } from "../script";

const words: Partial<Record<Beat, string>> = {
  humanFirst: "Humans first",
};

export function BackdropWord({ beat }: { beat: Beat }) {
  const opacity = pick({ humanFirst: 1 }, beat, 0);
  const word = words[beat];
  return (
    <AnimatePresence>
      {word && <Backdrop key={word} word={word} opacity={opacity} />}
    </AnimatePresence>
  );
}

function Backdrop({ word, opacity }: { word: string; opacity: number }) {
  return (
    <motion.p
      className="type-display absolute inset-x-0 top-[120px] text-center text-[400px] text-ink-faint"
      initial={{ opacity: 0, y: -40 }}
      animate={{ opacity, y: 0 }}
      exit={{ opacity: 0, y: -40 }}
      transition={sceneMove}
      aria-hidden
    >
      {word}
    </motion.p>
  );
}
