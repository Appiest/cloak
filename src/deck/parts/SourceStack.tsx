"use client";

import { AnimatePresence, motion } from "motion/react";
import { quickFade } from "../motion";
import type { Beat } from "../script";
import type { Source } from "../sources";
import { SourceNote } from "./SourceNote";

export type SourceBlock = { list: Source[]; left: number; width: number; bottom?: number; top?: number };

export function SourceStack({ beat, blocks }: { beat: Beat; blocks: Partial<Record<Beat, SourceBlock>> }) {
  const block = blocks[beat];
  return (
    <AnimatePresence mode="wait">
      {block && (
        <motion.div
          key={beat}
          className="absolute space-y-2"
          style={{ left: block.left, width: block.width, ...(block.top === undefined ? { bottom: block.bottom ?? 120 } : { top: block.top }) }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={quickFade}
        >
          {block.list.map((source) => (
            <SourceNote key={source.url} source={source} />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
