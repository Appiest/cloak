"use client";

import { AnimatePresence, motion } from "motion/react";
import { memo } from "react";
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
    value: 238,
    suffix: "",
    label: "times a week the average American is recorded",
    source: sources.weeklyCameraCount,
    highlighted: 238,
  },
  foundCamera: {
    value: 47,
    suffix: "%",
    label: "found some kind of camera in a rental property",
    source: sources.rentalSurvey,
    highlighted: 47,
  },
  cantDetect: {
    value: 64,
    suffix: "%",
    label: "would not know where to look for one",
    source: sources.rentalSurvey,
    highlighted: 64,
  },
};

type GridLayout = { columns: number; cell: number; gap: number; rowGap?: number; x: number; y: number; count: number };

// 34 a day across, seven days down. The block is the week.
const weekGrid: GridLayout = { columns: 34, cell: 26, gap: 8, rowGap: 18, x: 648, y: 372, count: 238 };
const waffle: GridLayout = { columns: 10, cell: 58, gap: 12, x: 1152, y: 196, count: 100 };

const layouts: Partial<Record<Beat, GridLayout>> = {
  perDay: weekGrid,
  foundCamera: waffle,
  cantDetect: waffle,
};

function cellOrigin(layout: GridLayout, index: number) {
  return {
    x: layout.x + (index % layout.columns) * (layout.cell + layout.gap),
    y: layout.y + Math.floor(index / layout.columns) * (layout.cell + (layout.rowGap ?? layout.gap)),
  };
}

function heroInFirstCell(layout: GridLayout): Placement {
  const origin = cellOrigin(layout, 0);
  return standingAt(origin.x + layout.cell / 2, origin.y + layout.cell - 6, layout.cell * 0.8);
}

export const countedHero = {
  // Too small to read inside a 26px cell, so the hero stands beside the block.
  perDay: standingAt(300, 900, 190),
  foundCamera: heroInFirstCell(waffle),
  cantDetect: heroInFirstCell(waffle),
} satisfies Partial<Record<Beat, Placement>>;

const cellIndexes = Array.from({ length: weekGrid.count }, (_, index) => index);

const tones = {
  plain: { background: "var(--color-feed)", figure: 0.35 },
  foundCamera: { background: "var(--color-feed)", figure: 1 },
  cantDetect: { background: "var(--color-ink)", figure: 1 },
  perDay: { background: "var(--color-feed)", figure: 0 },
};

function cellTone(beat: Beat, index: number, highlighted: number) {
  if (index >= highlighted) return tones.plain;
  return tones[beat as keyof typeof tones] ?? tones.plain;
}

export function Counted({ beat }: { beat: Beat }) {
  const stat = stats[beat];
  const layout = layouts[beat] ?? weekGrid;
  return (
    <div className="pointer-events-none absolute inset-0">
      {cellIndexes.map((index) => {
        const origin = cellOrigin(layout, index);
        const tone = cellTone(beat, index, stat?.highlighted ?? 0);
        const marked = beat === "foundCamera" && index < (stat?.highlighted ?? 0);
        const visible = beat in layouts && index < layout.count;
        return (
          <Cell
            key={index}
            index={index}
            x={origin.x}
            y={origin.y}
            size={layout.cell}
            visible={visible}
            background={tone.background}
            figureOpacity={tone.figure}
            dotOn={marked || beat === "perDay"}
            enterDelay={visible ? cellDelay(beat, index) : 0}
            dotDelay={seenDotDelay(beat, marked, index)}
          />
        );
      })}
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
            className="absolute bottom-[120px] left-[100px]"
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

type CellProps = {
  index: number;
  x: number;
  y: number;
  size: number;
  visible: boolean;
  background: string;
  figureOpacity: number;
  dotOn: boolean;
  enterDelay: number;
  dotDelay: number;
};

// Memoised on primitives. Every scene stays mounted, so without this all 238
// cells re-render on every beat change in the deck, including the eleven beats
// where this slide is not on screen at all.
const Cell = memo(function Cell(props: CellProps) {
  const { index, x, y, size, visible, background, figureOpacity, dotOn, enterDelay, dotDelay } = props;
  return (
    <motion.div
      className="absolute left-0 top-0 overflow-hidden"
      initial={false}
      animate={{ x, y, width: size, height: size, opacity: visible ? 1 : 0, backgroundColor: background }}
      transition={{ duration: 0.9, ease: sceneEase, delay: enterDelay }}
    >
      {index > 0 && (
        <motion.div
          className="absolute inset-x-0 bottom-1 mx-auto h-4/5 w-1/3"
          initial={false}
          animate={{ opacity: figureOpacity }}
          transition={quickFade}
        >
          <Figure className="size-full" />
        </motion.div>
      )}
      <motion.span
        className="absolute right-1.5 top-1.5 size-2 rounded-full bg-mark"
        style={{ boxShadow: "0 0 10px 2px var(--color-mark-glow)" }}
        initial={false}
        animate={{ opacity: dotOn ? 1 : 0 }}
        transition={{ ...quickFade, delay: dotDelay }}
      />
    </motion.div>
  );
});

function cellDelay(beat: Beat, index: number): number {
  if (beat === "perDay") return 0.2 + index * 0.004;
  return index * 0.004;
}

function seenDotDelay(beat: Beat, marked: boolean, index: number): number {
  if (beat === "perDay") return cellDelay(beat, index) + 0.1;
  return marked ? 0.6 + index * 0.02 : 0;
}
