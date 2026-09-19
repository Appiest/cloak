"use client";

import { motion } from "motion/react";
import { sceneMove } from "../motion";
import type { Beat } from "../script";

export function Question({ beat }: { beat: Beat }) {
  const visible = beat === "whatNow";
  return (
    <motion.h2
      className="type-display absolute inset-x-0 top-[150px] mx-auto max-w-[1500px] text-center text-[176px] text-ink"
      initial={false}
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 30 }}
      transition={{ ...sceneMove, delay: visible ? 0.4 : 0 }}
    >
      When it happens, what do we do?
    </motion.h2>
  );
}
