"use client";

import { AnimatePresence, motion } from "motion/react";
import { quickFade, sceneEase, sceneMove } from "../motion";
import { Cap } from "../parts/Cap";
import { CountUp } from "../parts/CountUp";
import { SourceStack, type SourceBlock } from "../parts/SourceStack";
import { isAtOrAfter, type Beat } from "../script";
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
        We built a working prototype
      </motion.h2>
    </div>
  );
}

const stateCount = 49;

function scatter(seed: number): number {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

// A loose field rather than a map: the point is coverage, not geography.
const nodes = Array.from({ length: stateCount }, (_, index) => ({
  id: index,
  x: Math.round(150 + scatter(index * 3.1) * 1620),
  y: Math.round(180 + scatter(index * 7.7 + 11) * 700),
}));

const links = nodes.flatMap((node) =>
  nodes
    .filter((other) => other.id > node.id)
    .map((other) => ({ node, other, span: Math.hypot(other.x - node.x, other.y - node.y) }))
    .filter((link) => link.span < 340),
);

export function Closing({ beat }: { beat: Beat }) {
  const wordmarkUp = isAtOrAfter(beat, "together");
  return (
    <div className="pointer-events-none absolute inset-0">
      <AnimatePresence>
        {beat === "flock" && (
          <motion.div
            key="flock"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: quickFade }}
            transition={quickFade}
          >
            <Network />
            <div className="absolute left-[100px] top-[80px] flex gap-28">
              <Tally value={5000} suffix="+" caption="agencies" />
              <Tally value={stateCount} suffix="" caption="states" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <Blackout firing={beat === "together"} />
      <motion.h2
        className="type-display absolute inset-x-0 top-[70px] text-center text-[260px] text-ink"
        initial={false}
        animate={{ opacity: wordmarkUp ? 1 : 0, y: wordmarkUp ? 0 : -30 }}
        transition={{ duration: 1.2, ease: sceneEase, delay: beat === "together" ? 3.4 : 0 }}
      >
        Cloak
      </motion.h2>
      <SourceStack beat={beat} blocks={beatSources} />
    </div>
  );
}

function Tally({ value, suffix, caption }: { value: number; suffix: string; caption: string }) {
  return (
    <div>
      <p className="type-display text-[170px] leading-none text-ink">
        <CountUp value={value} suffix={suffix} />
      </p>
      <p className="type-label mt-2 text-[34px] text-ink-muted">{caption}</p>
    </div>
  );
}

function Network() {
  return (
    <svg className="absolute inset-0 size-full" viewBox="0 0 1920 1080" aria-hidden>
      {links.map((link) => (
        <motion.line
          key={`${link.node.id}-${link.other.id}`}
          x1={link.node.x}
          y1={link.node.y}
          x2={link.other.x}
          y2={link.other.y}
          stroke="var(--color-mark)"
          strokeWidth="1.5"
          opacity="0.35"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, ease: sceneEase, delay: 0.9 + link.node.id * 0.035 }}
        />
      ))}
      {nodes.map((node) => (
        <motion.circle
          key={node.id}
          cx={node.x}
          cy={node.y}
          r="7"
          fill="var(--color-mark)"
          style={{ filter: "drop-shadow(0 0 10px var(--color-mark-glow))" }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.35, ease: sceneEase, delay: 0.5 + node.id * 0.035 }}
        />
      ))}
    </svg>
  );
}

// The caps blinding every lens at once. A background gradient rather than a
// filter, so it never hits the rasteriser's ceiling when it scales up.
function Blackout({ firing }: { firing: boolean }) {
  return (
    <motion.div
      className="pointer-events-none absolute left-1/2 top-[780px] size-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full mix-blend-screen"
      style={{ background: "radial-gradient(closest-side, oklch(1 0 0 / 0.95), oklch(1 0 0 / 0.35) 55%, transparent)" }}
      initial={false}
      animate={firing ? { opacity: [0, 1, 0], scale: [0.3, 3.2, 4] } : { opacity: 0, scale: 0.3 }}
      transition={firing ? { duration: 1.7, times: [0, 0.38, 1], ease: sceneEase, delay: 1.8 } : { duration: 0.3 }}
      aria-hidden
    />
  );
}
