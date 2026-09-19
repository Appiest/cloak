"use client";

import { AnimatePresence, motion } from "motion/react";
import { standingAt, type Placement } from "../geometry";
import { quickFade, sceneEase } from "../motion";
import { CountUp } from "../parts/CountUp";
import { Figure } from "../parts/Figure";
import { SourceNote } from "../parts/SourceNote";
import type { Beat } from "../script";
import { sources, type Source } from "../sources";

type Stat = { value: number; suffix: string; label: string; source: Source; highlighted: number };

const stats: Partial<Record<Beat, Stat>> = {
  perDay: {
    value: 70,
    suffix: "",
    label: "times a day the average Briton is caught on camera, by a 2011 police estimate",
    source: sources.ukCctvEstimate,
    highlighted: 70,
  },
  foundCamera: {
    value: 47,
    suffix: "%",
    label: "of Americans surveyed say they’ve discovered a camera in a rental property",
    source: sources.rentalSurvey,
    highlighted: 47,
  },
  cantDetect: {
    value: 64,
    suffix: "%",
    label: "don’t know how to detect a hidden camera in a rental",
    source: sources.rentalSurvey,
    highlighted: 64,
  },
};

type GridLayout = { columns: number; cell: number; gap: number; x: number; y: number; count: number };

const cameraRow: GridLayout = { columns: 14, cell: 68, gap: 12, x: 732, y: 330, count: 70 };
const waffle: GridLayout = { columns: 10, cell: 58, gap: 12, x: 1152, y: 196, count: 100 };

const layouts: Partial<Record<Beat, GridLayout>> = {
  perDay: cameraRow,
  foundCamera: waffle,
  cantDetect: waffle,
};

function cellOrigin(layout: GridLayout, index: number) {
  const pitch = layout.cell + layout.gap;
  return {
    x: layout.x + (index % layout.columns) * pitch,
    y: layout.y + Math.floor(index / layout.columns) * pitch,
  };
}

function heroInFirstCell(layout: GridLayout): Placement {
  const origin = cellOrigin(layout, 0);
  return standingAt(origin.x + layout.cell / 2, origin.y + layout.cell - 6, layout.cell * 0.8);
}

export const countedHero = {
  perDay: heroInFirstCell(cameraRow),
  foundCamera: heroInFirstCell(waffle),
  cantDetect: heroInFirstCell(waffle),
} satisfies Partial<Record<Beat, Placement>>;

const cellIndexes = Array.from({ length: 100 }, (_, index) => index);

const tones = {
  plain: { background: "var(--color-feed)", figure: 0.35 },
  foundCamera: { background: "var(--color-feed)", figure: 1 },
  cantDetect: { background: "var(--color-ink)", figure: 1 },
  perDay: { background: "var(--color-feed)", figure: 1 },
};

function cellTone(beat: Beat, index: number, highlighted: number) {
  if (index >= highlighted) return tones.plain;
  return tones[beat as keyof typeof tones] ?? tones.plain;
}

export function Counted({ beat }: { beat: Beat }) {
  const stat = stats[beat];
  const layout = layouts[beat] ?? cameraRow;
  return (
    <div className="pointer-events-none absolute inset-0">
      {cellIndexes.map((index) => (
        <Cell key={index} index={index} beat={beat} layout={layout} highlighted={stat?.highlighted ?? 0} />
      ))}
      <AnimatePresence>
        {stat && (
          <motion.div
            key="stat"
            className="absolute left-[100px] top-[300px] w-[600px]"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={quickFade}
          >
            <p className="type-display text-[260px] text-ink">
              <CountUp value={stat.value} suffix={stat.suffix} />
            </p>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={beat}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={quickFade}
              >
                <p className="type-label mt-6 text-ink-muted" style={{ textWrap: "balance" }}>
                  {stat.label}
                </p>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence mode="wait">
        {stat && (
          <motion.div
            key={stat.source.url}
            className="absolute bottom-[64px] left-[100px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={quickFade}
          >
            <SourceNote source={stat.source} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

type CellProps = { index: number; beat: Beat; layout: GridLayout; highlighted: number };

function Cell({ index, beat, layout, highlighted }: CellProps) {
  const visible = beat in layouts && index < layout.count;
  const origin = cellOrigin(layout, index);
  const tone = cellTone(beat, index, highlighted);
  const marked = beat === "foundCamera" && index < highlighted;
  return (
    <motion.div
      className="absolute left-0 top-0 overflow-hidden"
      initial={false}
      animate={{
        x: origin.x,
        y: origin.y,
        width: layout.cell,
        height: layout.cell,
        opacity: visible ? 1 : 0,
        backgroundColor: tone.background,
      }}
      transition={{ duration: 0.9, ease: sceneEase, delay: visible ? cellDelay(beat, index) : 0 }}
    >
      {index > 0 && (
        <motion.div
          className="absolute inset-x-0 bottom-1 mx-auto h-4/5 w-1/3"
          initial={false}
          animate={{ opacity: tone.figure }}
          transition={quickFade}
        >
          <Figure className="size-full" />
        </motion.div>
      )}
      <motion.span
        className="absolute right-1.5 top-1.5 size-2 rounded-full bg-mark"
        style={{ boxShadow: "0 0 10px 2px var(--color-mark-glow)" }}
        initial={false}
        animate={{ opacity: marked || beat === "perDay" ? 1 : 0 }}
        transition={{ ...quickFade, delay: marked ? 0.6 + index * 0.02 : 0 }}
      />
    </motion.div>
  );
}

function cellDelay(beat: Beat, index: number): number {
  if (beat === "perDay") return 0.3 + index * 0.024;
  return index * 0.004;
}
