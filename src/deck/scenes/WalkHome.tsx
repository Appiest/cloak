"use client";

import { motion, useTransform, type MotionValue, type Transition } from "motion/react";
import { pointOnFigure, standingAt, type Placement } from "../geometry";
import { quickFade, sceneEase } from "../motion";
import type { Beat } from "../script";

const street = { groundY: 900, height: 560 };

export const walkStart = standingAt(1550, street.groundY, street.height);
const walkMidway = standingAt(1120, street.groundY, street.height);
const walkEnd = standingAt(720, street.groundY, street.height);

export const walkHero = {
  title: walkStart,
  alone: walkMidway,
  watched: walkEnd,
} satisfies Partial<Record<Beat, Placement>>;

const strideSeconds: Partial<Record<Beat, number>> = { alone: 6, watched: 8 };

export function isWalking(beat: Beat) {
  return beat in strideSeconds;
}

export function walkTransition(beat: Beat, base: Transition): Transition {
  const seconds = strideSeconds[beat];
  if (!seconds) return base;
  return { ...base, x: { duration: seconds, ease: "linear" }, opacity: quickFade };
}

type Watcher = { x: number; y: number; size: number };

const watchers: Watcher[] = [
  { x: 250, y: 150, size: 110 },
  { x: 760, y: 90, size: 90 },
  { x: 1260, y: 170, size: 120 },
  { x: 1690, y: 330, size: 100 },
  { x: 1480, y: 640, size: 80 },
  { x: 180, y: 560, size: 90 },
];

function headAt(heroLeft: number) {
  return pointOnFigure({ ...walkEnd, x: heroLeft }, 100, 58);
}

const headRadius = pointOnFigure(walkEnd, 132, 58).x - pointOnFigure(walkEnd, 100, 58).x;

function aimAngle(watcher: Watcher, heroLeft: number) {
  const head = headAt(heroLeft);
  return (Math.atan2(head.y - watcher.y, head.x - watcher.x) * 180) / Math.PI;
}

function viewCone(watcher: Watcher, heroLeft: number) {
  const head = headAt(heroLeft);
  const dx = head.x - watcher.x;
  const dy = head.y - watcher.y;
  const length = Math.hypot(dx, dy);
  const along = { x: dx / length, y: dy / length };
  const lensReach = watcher.size * 0.36;
  const lens = { x: watcher.x + along.x * lensReach, y: watcher.y + along.y * lensReach };
  const spread = headRadius * 1.3;
  const left = { x: head.x - along.y * spread, y: head.y + along.x * spread };
  const right = { x: head.x + along.y * spread, y: head.y - along.x * spread };
  return `M${lens.x} ${lens.y} L${left.x} ${left.y} L${right.x} ${right.y} Z`;
}

export function WalkHome({ beat, heroX }: { beat: Beat; heroX: MotionValue<number> }) {
  const visible = isWalking(beat);
  const watching = beat === "watched";
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <motion.div
        className="absolute inset-0"
        initial={false}
        animate={{ opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.8, ease: sceneEase }}
      >
        <div className="absolute inset-x-0 h-px bg-line/60" style={{ top: street.groundY }} />
        <House />
      </motion.div>
      <svg className="absolute inset-0 size-full" viewBox="0 0 1920 1080">
        {watchers.map((watcher, index) => (
          <ViewCone key={`${watcher.x}-${watcher.y}`} watcher={watcher} watching={watching} order={index} heroX={heroX} />
        ))}
      </svg>
      {watchers.map((watcher, index) => (
        <FloatingCamera key={`${watcher.x}-${watcher.y}`} watcher={watcher} watching={watching} order={index} heroX={heroX} />
      ))}
    </div>
  );
}

type WatcherProps = { watcher: Watcher; watching: boolean; order: number; heroX: MotionValue<number> };

function ViewCone({ watcher, watching, order, heroX }: WatcherProps) {
  const d = useTransform(heroX, (left) => viewCone(watcher, left));
  return (
    <motion.path
      d={d}
      fill="var(--color-mark-glow)"
      fillOpacity={0.12}
      initial={false}
      animate={{ opacity: watching ? 1 : 0 }}
      transition={{ ...quickFade, delay: watching ? 0.8 + order * 0.35 : 0 }}
    />
  );
}

function House() {
  return (
    <svg className="absolute left-[60px] top-[560px] h-[340px] w-[360px]" viewBox="0 0 360 340">
      <path d="M20 150 L180 30 L340 150 V340 H20 Z" fill="var(--color-feed-raised)" />
      <path d="M0 160 L180 20 L360 160" fill="none" stroke="var(--color-line)" strokeWidth="6" />
      <rect x="140" y="220" width="80" height="120" fill="var(--color-stage)" />
      <rect x="250" y="190" width="60" height="60" fill="var(--color-ink-muted)" opacity="0.5" />
    </svg>
  );
}

function FloatingCamera({ watcher, watching, order, heroX }: WatcherProps) {
  const rotate = useTransform(heroX, (left) => aimAngle(watcher, left));
  const delay = 0.5 + order * 0.35;
  return (
    <motion.div
      className="absolute left-0 top-0"
      style={{ x: watcher.x - watcher.size / 2, y: watcher.y - watcher.size / 2, width: watcher.size, height: watcher.size }}
      initial={false}
      animate={{ opacity: watching ? 1 : 0, scale: watching ? 1 : 0.25 }}
      transition={watching ? { type: "spring", duration: 0.5, bounce: 0, delay } : quickFade}
    >
      <motion.div
        className="size-full"
        initial={false}
        animate={{ y: watching ? [0, -4, 0] : 0 }}
        transition={{ duration: 2.6 + order * 0.3, ease: "easeInOut", repeat: Infinity }}
      >
        <motion.div className="size-full" style={{ rotate }}>
          <CameraBody />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

function CameraBody() {
  return (
    <svg viewBox="0 0 100 100" className="size-full overflow-visible">
      <rect x="18" y="36" width="58" height="28" fill="var(--color-figure)" />
      <rect x="76" y="40" width="10" height="20" fill="var(--color-figure-shade)" />
      <circle cx="86" cy="50" r="6" fill="var(--color-mark)" style={{ filter: "drop-shadow(0 0 4px var(--color-mark))" }} />
      <rect x="10" y="42" width="8" height="16" fill="var(--color-figure-shade)" />
    </svg>
  );
}
