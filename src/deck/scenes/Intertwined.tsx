"use client";

import { AnimatePresence, motion } from "motion/react";
import { quickFade, sceneEase } from "../motion";
import { CountUp } from "../parts/CountUp";
import { SourceStack, type SourceBlock } from "../parts/SourceStack";
import { Waveform } from "../parts/Waveform";
import type { Beat } from "../script";
import { sources } from "../sources";

const beatSources: Partial<Record<Beat, SourceBlock>> = {
  flockNetwork: { list: [sources.flockAgencies, sources.flockStates], left: 100, width: 720, top: 80 },
};

function scatter(seed: number): number {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

const stateCount = 49;

// A loose field rather than a map: the point is coverage, not geography.
const nodes = Array.from({ length: stateCount }, (_, index) => ({
  id: index,
  x: Math.round(150 + scatter(index * 3.1) * 1620),
  y: Math.round(250 + scatter(index * 7.7 + 11) * 560),
}));

const links = nodes.flatMap((node) =>
  nodes
    .filter((other) => other.id > node.id)
    .filter((other) => Math.hypot(other.x - node.x, other.y - node.y) < 320)
    .map((other) => ({ from: node, to: other })),
);

const lenses = Array.from({ length: 84 }, (_, index) => ({
  id: index,
  x: Math.round(90 + scatter(index * 5.3 + 2) * 1740),
  y: Math.round(180 + scatter(index * 9.1 + 31) * 700),
  size: Math.round(26 + scatter(index * 2.7) * 22),
}));

export function Intertwined({ beat }: { beat: Beat }) {
  return (
    <div className="pointer-events-none absolute inset-0">
      <FlockNetwork shown={beat === "flockNetwork"} />
      <Nationwide shown={beat === "nationwide"} />
      <WhatTheyHold shown={beat === "frontierModels"} />
      <SourceStack beat={beat} blocks={beatSources} />
    </div>
  );
}

function FlockNetwork({ shown }: { shown: boolean }) {
  return (
    <AnimatePresence>
      {shown && (
        <motion.div
          key="flock"
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: quickFade }}
          transition={quickFade}
        >
          <svg className="absolute inset-0 size-full" viewBox="0 0 1920 1080" aria-hidden>
            {links.map((link) => (
              <motion.line
                key={`${link.from.id}-${link.to.id}`}
                x1={link.from.x}
                y1={link.from.y}
                x2={link.to.x}
                y2={link.to.y}
                stroke="var(--color-mark)"
                strokeWidth="1.5"
                opacity="0.32"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6, ease: sceneEase, delay: 0.7 + link.from.id * 0.03 }}
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
                transition={{ duration: 0.3, ease: sceneEase, delay: 0.35 + node.id * 0.03 }}
              />
            ))}
          </svg>
          <div className="absolute bottom-[130px] left-[100px] flex gap-28">
            <Tally value={5000} suffix="+" caption="agencies" />
            <Tally value={stateCount} suffix="" caption="states" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Tally({ value, suffix, caption }: { value: number; suffix: string; caption: string }) {
  return (
    <div>
      <p className="type-display text-[150px] leading-none text-ink">
        <CountUp value={value} suffix={suffix} />
      </p>
      <p className="type-label mt-2 text-[34px] text-ink-muted">{caption}</p>
    </div>
  );
}

// Lenses, not nodes: the second beat is the count of things pointed at people,
// so it has to read as a different kind of object from the network.
function Nationwide({ shown }: { shown: boolean }) {
  return (
    <AnimatePresence>
      {shown && (
        <motion.svg
          key="nationwide"
          className="absolute inset-0 size-full"
          viewBox="0 0 1920 1080"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: quickFade }}
          transition={quickFade}
          aria-hidden
        >
          {lenses.map((lens) => (
            <motion.g
              key={lens.id}
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease: sceneEase, delay: 0.2 + lens.id * 0.022 }}
              style={{ transformOrigin: `${lens.x}px ${lens.y}px` }}
            >
              <rect
                x={lens.x - lens.size * 0.9}
                y={lens.y - lens.size * 0.5}
                width={lens.size * 1.8}
                height={lens.size}
                fill="var(--color-feed-raised)"
              />
              <circle cx={lens.x + lens.size * 0.55} cy={lens.y} r={lens.size * 0.3} fill="var(--color-mark)" />
            </motion.g>
          ))}
        </motion.svg>
      )}
    </AnimatePresence>
  );
}

// Ordered around the perimeter so the edges trace the face instead of
// zigzagging across it. The inner points are drawn but not joined.
const facePerimeter = [
  { x: -78, y: -70 },
  { x: 0, y: -92 },
  { x: 78, y: -70 },
  { x: 96, y: 0 },
  { x: 70, y: 74 },
  { x: 0, y: 104 },
  { x: -70, y: 74 },
  { x: -96, y: 0 },
];

const faceInner = [
  { x: -40, y: -24 },
  { x: 40, y: -24 },
  { x: 0, y: 18 },
  { x: -32, y: 56 },
  { x: 32, y: 56 },
];

const faceDots = [...facePerimeter, ...faceInner];

const faceAt = { x: 560, y: 500 };
const faceScale = 1.55;

function facePoint(dot: { x: number; y: number }) {
  return { x: Math.round(faceAt.x + dot.x * faceScale), y: Math.round(faceAt.y + dot.y * faceScale) };
}

// The last beat is what the models actually hold: your face and your voice,
// both reduced to something a machine can index.
function WhatTheyHold({ shown }: { shown: boolean }) {
  return (
    <AnimatePresence>
      {shown && (
        <motion.div
          key="held"
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: quickFade }}
          transition={quickFade}
        >
          <svg className="absolute inset-0 size-full" viewBox="0 0 1920 1080" aria-hidden>
            <ellipse
              cx={faceAt.x}
              cy={faceAt.y}
              rx={Math.round(150 * faceScale)}
              ry={Math.round(190 * faceScale)}
              fill="none"
              stroke="var(--color-line)"
              strokeWidth="3"
            />
            {facePerimeter.map((dot, index) => {
              const from = facePoint(dot);
              const to = facePoint(facePerimeter[(index + 1) % facePerimeter.length]);
              return (
                <motion.line
                  key={`edge-${dot.x}-${dot.y}`}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke="var(--color-mark)"
                  strokeWidth="2"
                  opacity="0.5"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.4, ease: sceneEase, delay: 0.9 + index * 0.05 }}
                />
              );
            })}
            {faceDots.map((dot, index) => {
              const at = facePoint(dot);
              return (
                <motion.circle
                  key={`${dot.x}-${dot.y}`}
                  cx={at.x}
                  cy={at.y}
                  r="11"
                  fill="var(--color-mark)"
                  style={{ filter: "drop-shadow(0 0 10px var(--color-mark-glow))" }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, ease: sceneEase, delay: 0.3 + index * 0.05 }}
                />
              );
            })}
          </svg>
          <motion.div
            className="absolute"
            style={{ left: 1020, top: 380, width: 820, height: 260 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: sceneEase, delay: 1.1 }}
          >
            <Waveform barClassName="bg-mark" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
