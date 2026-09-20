"use client";

import { AnimatePresence, motion } from "motion/react";
import { useId } from "react";
import { figureSize, headAt, pointOnFigure, sideFeed, type Placement } from "../geometry";
import { quickFade, sceneEase, sceneMove } from "../motion";
import { Brackets } from "../parts/Brackets";
import { Cap, capLeds } from "../parts/Cap";
import { CountUp } from "../parts/CountUp";
import { FaceCount } from "../parts/FaceCount";
import { Figure } from "../parts/Figure";
import { Osd } from "../parts/Osd";
import { SourceStack, type SourceBlock } from "../parts/SourceStack";
import type { Beat } from "../script";
import { sources } from "../sources";

export const infraredHero = {
  irLight: headAt(620, 500, 5.2),
  noFace: headAt(330, 760, 3),
} satisfies Partial<Record<Beat, Placement>>;

const cameraFeed = sideFeed;
const faceInFeed = headAt(cameraFeed.w / 2, 330, 4.8);

const beatSources: Partial<Record<Beat, SourceBlock>> = {
  irLight: { list: [sources.infraredMask], left: 100, width: 700 },
  noFace: { list: [sources.infraredMask, sources.phoneIrFilters], left: cameraFeed.x, width: cameraFeed.w },
};

export function Infrared({ beat }: { beat: Beat }) {
  const failing = beat === "noFace";
  return (
    <div className="pointer-events-none absolute inset-0">
      <CameraView visible={failing} />
      <AnimatePresence>
        {failing && (
          <motion.div
            key="stat"
            className="absolute left-[100px] top-[110px] w-[600px]"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: quickFade }}
            transition={{ ...quickFade, delay: 0.4 }}
          >
            <p className="type-display text-[220px] text-ink">
              <CountUp value={0} />
            </p>
            <p className="type-label mt-4 text-ink-muted" style={{ textWrap: "balance" }}>
              frames where software found a face on a researcher wearing three infrared LEDs on a cap
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {failing && (
          <motion.p
            key="caveat"
            className="type-label absolute text-[32px] text-ink-muted"
            style={{ left: cameraFeed.x, top: cameraFeed.y + cameraFeed.h + 32, width: cameraFeed.w, textWrap: "pretty" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: quickFade }}
            transition={{ ...quickFade, delay: 1.6 }}
          >
            Many phones filter infrared out of their rear camera, so those lenses can still see your face.
          </motion.p>
        )}
      </AnimatePresence>
      <SourceStack beat={beat} blocks={beatSources} />
    </div>
  );
}

function coneTowardFace(led: { x: number; y: number }) {
  const spread = 11;
  const aimX = 100 + (led.x - 100) * 0.75;
  const faceY = 92;
  const apex = pointOnFigure(infraredHero.irLight, led.x, led.y);
  const left = pointOnFigure(infraredHero.irLight, aimX - spread, faceY);
  const right = pointOnFigure(infraredHero.irLight, aimX + spread, faceY);
  return `M${apex.x} ${apex.y} L${left.x} ${left.y} L${right.x} ${right.y} Z`;
}

function faceCircle() {
  const center = pointOnFigure(infraredHero.irLight, 100, 58);
  const edge = pointOnFigure(infraredHero.irLight, 132, 58);
  return { cx: center.x, cy: center.y, r: edge.x - center.x };
}

export function InfraredLight({ beat }: { beat: Beat }) {
  const visible = beat === "irLight";
  const clipId = useId();
  return (
    <svg className="absolute inset-0 size-full" viewBox="0 0 1920 1080" aria-hidden>
      <clipPath id={clipId}>
        <circle {...faceCircle()} />
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
          animate={{ opacity: visible ? 1 : 0, pathLength: visible ? 1 : 0 }}
          transition={{ duration: 0.8, ease: sceneEase, delay: visible ? 1 + index * 0.1 : 0 }}
        />
      ))}
      </g>
    </svg>
  );
}

function CameraView({ visible }: { visible: boolean }) {
  return (
    <motion.div
      className="absolute overflow-hidden bg-feed"
      style={{ left: cameraFeed.x, top: cameraFeed.y, width: cameraFeed.w, height: cameraFeed.h }}
      initial={false}
      animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.96 }}
      transition={{ ...sceneMove, delay: visible ? 0.3 : 0 }}
    >
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{
          width: figureSize.w,
          height: figureSize.h,
          transform: `translate(${faceInFeed.x}px, ${faceInFeed.y}px) scale(${faceInFeed.scale})`,
        }}
      >
        <Figure className="absolute inset-0 size-full" />
        <FaceBloom visible={visible} />
        <Cap className="absolute inset-0 size-full" glowing ledColor="var(--color-ink)" />
      </div>
      {visible && <SearchingReticle />}
      <div className="absolute inset-0 shadow-[inset_0_0_0_1px_oklch(1_0_0/0.1)]" />
      <Osd camera="CAM 01" />
      <FaceCount />
    </motion.div>
  );
}

const faceBloom = { x: 123 - 48, y: 94 - 42, w: 96, h: 84 };

function FaceBloom({ visible }: { visible: boolean }) {
  return (
    <motion.div
      className="absolute rounded-full mix-blend-screen"
      style={{
        left: faceBloom.x,
        top: faceBloom.y,
        width: faceBloom.w,
        height: faceBloom.h,
        background: "radial-gradient(closest-side, oklch(1 0 0) 50%, oklch(1 0 0 / 0.5) 75%, transparent)",
      }}
      initial={false}
      animate={visible ? { opacity: [0, 1, 0.85, 1], scale: [0.6, 1, 0.97, 1] } : { opacity: 0, scale: 0.6 }}
      transition={{ duration: 1.2, ease: sceneEase, delay: visible ? 1 : 0 }}
    />
  );
}

const searchPath = {
  x: [380, 560, 300, 470, 380],
  y: [150, 190, 250, 120, 150],
};

function SearchingReticle() {
  return (
    <motion.div
      className="absolute left-0 top-0 size-[220px]"
      initial={{ opacity: 0, x: searchPath.x[0], y: searchPath.y[0] }}
      animate={{ opacity: [0, 1, 0.4, 1], ...searchPath }}
      transition={{
        opacity: { duration: 1.2, delay: 1.4, repeat: Infinity, repeatType: "reverse" },
        x: { duration: 4, delay: 1.4, repeat: Infinity, ease: "easeInOut" },
        y: { duration: 4, delay: 1.4, repeat: Infinity, ease: "easeInOut" },
      }}
    >
      <Brackets arm={36} weight={3} />
    </motion.div>
  );
}
