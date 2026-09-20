"use client";

import { motion } from "motion/react";
import { useId } from "react";
import { pointOnFigure, productStage, type Placement } from "../geometry";
import { sceneEase } from "../motion";
import { Brackets } from "../parts/Brackets";
import { capLeds } from "../parts/Cap";
import { SourceStack, type SourceBlock } from "../parts/SourceStack";
import type { Beat } from "../script";
import { sources } from "../sources";

export const infraredHero = {
  irLight: productStage,
  noFace: productStage,
} satisfies Partial<Record<Beat, Placement>>;

const beatSources: Partial<Record<Beat, SourceBlock>> = {
  irLight: { list: [sources.infraredMask], left: 100, width: 500 },
  noFace: { list: [sources.infraredMask, sources.phoneIrFilters], left: 100, width: 500 },
};

export function Infrared({ beat }: { beat: Beat }) {
  return (
    <div className="pointer-events-none absolute inset-0">
      <SourceStack beat={beat} blocks={beatSources} />
    </div>
  );
}

function coneTowardFace(led: { x: number; y: number }) {
  const spread = 11;
  const aimX = 100 + (led.x - 100) * 0.75;
  const faceY = 92;
  const apex = pointOnFigure(productStage, led.x, led.y);
  const left = pointOnFigure(productStage, aimX - spread, faceY);
  const right = pointOnFigure(productStage, aimX + spread, faceY);
  return `M${apex.x} ${apex.y} L${left.x} ${left.y} L${right.x} ${right.y} Z`;
}

function faceCircle() {
  const center = pointOnFigure(productStage, 100, 58);
  const edge = pointOnFigure(productStage, 132, 58);
  return { cx: center.x, cy: center.y, r: edge.x - center.x };
}

const face = faceCircle();

// The lens hunts around where his face is and never settles on it.
const hunt = {
  x: [face.cx - 340, face.cx + 300, face.cx - 190, face.cx + 240, face.cx - 340],
  y: [face.cy - 260, face.cy + 150, face.cy + 240, face.cy - 180, face.cy - 260],
};

export function InfraredLight({ beat }: { beat: Beat }) {
  const lighting = beat === "irLight";
  const blinded = beat === "noFace";
  const clipId = useId();
  return (
    <div className="pointer-events-none absolute inset-0">
      <svg className="absolute inset-0 size-full" viewBox="0 0 1920 1080" aria-hidden>
        <clipPath id={clipId}>
          <circle {...face} />
        </clipPath>
        <g clipPath={`url(#${clipId})`}>
          {capLeds.map((led, index) => (
            <motion.path
              key={led.x}
              d={coneTowardFace(led)}
              fill="var(--color-mark-glow)"
              fillOpacity={0.18}
              stroke="var(--color-mark)"
              strokeWidth={2}
              strokeDasharray="8 7"
              initial={false}
              animate={{ opacity: lighting ? 1 : 0, pathLength: lighting ? 1 : 0 }}
              transition={{ duration: 0.8, ease: sceneEase, delay: lighting ? 1 + index * 0.1 : 0 }}
            />
          ))}
        </g>
      </svg>
      <FaceWhiteout blinded={blinded} />
      {blinded && <LostLock />}
    </div>
  );
}

function FaceWhiteout({ blinded }: { blinded: boolean }) {
  return (
    <motion.div
      className="absolute rounded-full mix-blend-screen"
      style={{
        left: face.cx - face.r * 1.15,
        top: face.cy - face.r * 1.25,
        width: face.r * 2.3,
        height: face.r * 2.5,
        background: "radial-gradient(closest-side, oklch(1 0 0) 52%, oklch(1 0 0 / 0.55) 76%, transparent)",
      }}
      initial={false}
      animate={blinded ? { opacity: [0, 1, 0.88, 1], scale: [0.6, 1.04, 0.99, 1] } : { opacity: 0, scale: 0.6 }}
      transition={{ duration: 1.1, ease: sceneEase, delay: blinded ? 0.35 : 0 }}
      aria-hidden
    />
  );
}

function LostLock() {
  return (
    <motion.div
      className="absolute left-0 top-0 size-[300px]"
      initial={{ opacity: 0, x: hunt.x[0], y: hunt.y[0] }}
      animate={{ opacity: [0, 1, 0.35, 1], x: hunt.x, y: hunt.y }}
      transition={{
        opacity: { duration: 1.3, delay: 1.1, repeat: Infinity, repeatType: "reverse" },
        x: { duration: 4.6, delay: 1.1, repeat: Infinity, ease: "easeInOut" },
        y: { duration: 4.6, delay: 1.1, repeat: Infinity, ease: "easeInOut" },
      }}
      aria-hidden
    >
      <Brackets arm={48} weight={4} />
    </motion.div>
  );
}
