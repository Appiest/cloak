"use client";

import { motion } from "motion/react";
import { quickFade, sceneEase } from "../motion";
import { SourceStack, type SourceBlock } from "../parts/SourceStack";
import type { Beat } from "../script";
import { sources } from "../sources";

const ground = 930;

const beatSources: Partial<Record<Beat, SourceBlock>> = {
  protections: { list: [sources.gaoPrivacyLaw, sources.airbnbCameraBan], left: 1120, width: 700 },
};

type Point = { x: number; y: number };

const launch = {
  from: { x: 250, y: ground - 40 },
  controlA: { x: 640, y: 900 },
  controlB: { x: 1020, y: 560 },
  to: { x: 1880, y: 90 },
};

function bezierAt(t: number): Point {
  const inverse = 1 - t;
  const a = inverse ** 3;
  const b = 3 * inverse ** 2 * t;
  const c = 3 * inverse * t ** 2;
  const d = t ** 3;
  // Rounded: long floats serialise differently on the server and client and
  // trip a hydration mismatch.
  return {
    x: Math.round(a * launch.from.x + b * launch.controlA.x + c * launch.controlB.x + d * launch.to.x),
    y: Math.round(a * launch.from.y + b * launch.controlA.y + c * launch.controlB.y + d * launch.to.y),
  };
}

const trailPath = `M${launch.from.x} ${launch.from.y} C${launch.controlA.x} ${launch.controlA.y} ${launch.controlB.x} ${launch.controlB.y} ${launch.to.x} ${launch.to.y}`;

const flightSteps = Array.from({ length: 13 }, (_, index) => index / 12);
const flight = flightSteps.map(bezierAt);

function headingAt(t: number): number {
  const ahead = bezierAt(Math.min(1, t + 0.02));
  const behind = bezierAt(Math.max(0, t - 0.02));
  return Math.round((Math.atan2(ahead.y - behind.y, ahead.x - behind.x) * 180) / Math.PI * 100) / 100;
}

const flightSeconds = 2.4;

export function Timeline({ beat }: { beat: Beat }) {
  const launching = beat === "watchers" || beat === "protections";
  const crawling = beat === "protections";
  return (
    <div className="pointer-events-none absolute inset-0">
      <motion.div initial={false} animate={{ opacity: launching ? 1 : 0 }} transition={quickFade}>
        <div className="absolute h-px bg-line/40" style={{ left: 0, right: 0, top: ground }} />
        <Trail launching={launching} />
        <Rocket launching={launching} />
        <TheLaw crawling={crawling} />
      </motion.div>
      <SourceStack beat={beat} blocks={beatSources} />
    </div>
  );
}

function Trail({ launching }: { launching: boolean }) {
  return (
    <svg className="absolute inset-0 size-full" viewBox="0 0 1920 1080" aria-hidden>
      <motion.path
        d={trailPath}
        stroke="var(--color-mark)"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
        opacity="0.55"
        style={{ filter: "drop-shadow(0 0 14px var(--color-mark-glow))" }}
        initial={false}
        animate={{ pathLength: launching ? 1 : 0 }}
        transition={{ duration: flightSeconds, ease: "easeIn" }}
      />
    </svg>
  );
}

function Rocket({ launching }: { launching: boolean }) {
  return (
    <motion.div
      className="absolute left-0 top-0"
      initial={false}
      animate={
        launching
          ? { x: flight.map((point) => point.x), y: flight.map((point) => point.y), opacity: [0, 1, 1, 1] }
          : { x: flight[0].x, y: flight[0].y, opacity: 0 }
      }
      transition={
        launching
          ? { duration: flightSeconds, ease: "easeIn", opacity: { duration: 0.3, times: [0, 0.1, 0.5, 1] } }
          : { duration: 0 }
      }
    >
      <motion.div
        initial={false}
        animate={{ rotate: launching ? flightSteps.map(headingAt) : headingAt(0) }}
        transition={launching ? { duration: flightSeconds, ease: "easeIn" } : { duration: 0 }}
      >
        <RocketBody />
      </motion.div>
    </motion.div>
  );
}

// The nose is a lens: the thing accelerating away is the watching, not just technology.
function RocketBody() {
  return (
    <svg width="260" height="120" viewBox="0 0 260 120" className="-translate-x-1/2 -translate-y-1/2 overflow-visible">
      <path d="M60 32 H170 C210 32 238 44 252 60 C238 76 210 88 170 88 H60 Z" fill="var(--color-ink-muted)" />
      <path d="M60 32 L18 4 L38 36 Z" fill="var(--color-figure-shade)" />
      <path d="M60 88 L18 116 L38 84 Z" fill="var(--color-figure-shade)" />
      <circle cx="214" cy="60" r="15" fill="var(--color-stage)" />
      <circle cx="214" cy="60" r="7" fill="var(--color-mark)" style={{ filter: "drop-shadow(0 0 8px var(--color-mark-glow))" }} />
      <motion.path
        d="M60 42 L-70 60 L60 78 Z"
        fill="var(--color-mark)"
        style={{ filter: "drop-shadow(0 0 20px var(--color-mark-glow))", transformOrigin: "60px 60px" }}
        animate={{ scaleX: [1, 0.68, 1.1, 0.85, 1], opacity: [0.95, 0.7, 1, 0.8, 0.95] }}
        transition={{ duration: 0.34, repeat: Infinity, ease: "linear" }}
      />
    </svg>
  );
}

const crawlDistance = 120;

// Paper, carried at walking pace, on the ground the rocket left behind.
function TheLaw({ crawling }: { crawling: boolean }) {
  return (
    <motion.div
      className="absolute left-0 top-0"
      initial={false}
      animate={{ x: crawling ? 210 + crawlDistance : 210, opacity: crawling ? 1 : 0 }}
      transition={{ x: { duration: 6, ease: "linear" }, opacity: { duration: 0.6, ease: sceneEase } }}
    >
      <svg width="220" height="260" viewBox="0 0 220 260" style={{ transform: `translateY(${ground - 250}px)` }}>
        <rect x="24" y="150" width="96" height="14" fill="var(--color-line)" />
        <rect x="30" y="132" width="84" height="14" fill="var(--color-line)" />
        <rect x="36" y="114" width="72" height="14" fill="var(--color-line)" />
        <circle cx="158" cy="96" r="20" fill="var(--color-figure)" />
        <path d="M138 122 H178 L186 196 H130 Z" fill="var(--color-figure)" />
        <path d="M138 196 L132 250 H146 L154 200 Z" fill="var(--color-figure)" />
        <path d="M170 196 L178 250 H192 L186 200 Z" fill="var(--color-figure)" />
        <path d="M138 134 L104 150" stroke="var(--color-figure)" strokeWidth="12" strokeLinecap="round" />
      </svg>
    </motion.div>
  );
}
