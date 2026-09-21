"use client";

import { motion } from "motion/react";
import { figureSize, standingAt, type Placement } from "../geometry";
import { quickFade, sceneEase } from "../motion";
import { Brackets } from "../parts/Brackets";
import { Figure } from "../parts/Figure";
import { SourceStack, type SourceBlock } from "../parts/SourceStack";
import type { Beat } from "../script";
import { sources } from "../sources";

const ground = 930;

const beatSources: Partial<Record<Beat, SourceBlock>> = {
  // Bottom left is where the law walks, so the citations go to the empty top.
  protections: { list: [sources.gaoPrivacyLaw, sources.airbnbCameraBan], left: 100, width: 620, top: 80 },
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
  return Math.round(((Math.atan2(ahead.y - behind.y, ahead.x - behind.x) * 180) / Math.PI) * 100) / 100;
}

// The law sets off first and is still walking when the rocket overtakes it.
const lawWalkSeconds = 11;
const rocketDelay = 1.8;
const flightSeconds = 5;

export function Timeline({ beat }: { beat: Beat }) {
  const onSlide = beat === "watchers" || beat === "protections";
  const designing = beat === "protections";
  return (
    <div className="pointer-events-none absolute inset-0">
      <motion.div initial={false} animate={{ opacity: onSlide ? 1 : 0 }} transition={quickFade}>
        <div className="absolute h-px bg-line/40" style={{ left: 0, right: 0, top: ground }} />
        <Trail flying={onSlide} spent={designing} />
        <Rocket flying={onSlide} gone={designing} />
        <TheLaw walking={onSlide} />
        <OurSolution designing={designing} />
      </motion.div>
      <SourceStack beat={beat} blocks={beatSources} />
    </div>
  );
}

function Trail({ flying, spent }: { flying: boolean; spent: boolean }) {
  return (
    <svg className="absolute inset-0 size-full" viewBox="0 0 1920 1080" aria-hidden>
      <motion.path
        d={trailPath}
        stroke="var(--color-mark)"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
        style={{ filter: "drop-shadow(0 0 14px var(--color-mark-glow))" }}
        initial={false}
        animate={{ pathLength: flying ? 1 : 0, opacity: spent ? 0.2 : 0.55 }}
        transition={{ duration: flightSeconds, ease: "easeIn", delay: flying && !spent ? rocketDelay : 0 }}
      />
    </svg>
  );
}

function Rocket({ flying, gone }: { flying: boolean; gone: boolean }) {
  const travelling = flying && !gone;
  const last = flight[flight.length - 1];
  return (
    <motion.div
      className="absolute left-0 top-0"
      initial={false}
      animate={
        travelling
          ? { x: flight.map((point) => point.x), y: flight.map((point) => point.y), opacity: [0, 1, 1, 1] }
          : { x: last.x, y: last.y, opacity: 0 }
      }
      transition={
        travelling
          ? {
              duration: flightSeconds,
              delay: rocketDelay,
              ease: "easeIn",
              opacity: { duration: 0.2, delay: rocketDelay, times: [0, 0.2, 0.6, 1] },
            }
          : { duration: 0.3 }
      }
    >
      <motion.div
        initial={false}
        animate={{ rotate: travelling ? flightSteps.map(headingAt) : headingAt(1) }}
        transition={travelling ? { duration: flightSeconds, delay: rocketDelay, ease: "easeIn" } : { duration: 0 }}
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

// Paper, carried at walking pace, on the ground the rocket leaves behind.
function TheLaw({ walking }: { walking: boolean }) {
  return (
    <motion.div
      className="absolute left-0 top-0"
      initial={false}
      animate={{ x: walking ? 480 : 60, opacity: walking ? 1 : 0 }}
      transition={{ x: { duration: lawWalkSeconds, ease: "linear" }, opacity: { duration: 0.5, ease: sceneEase } }}
      aria-hidden
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

const household: Placement[] = [
  standingAt(1090, ground, 300),
  standingAt(1280, ground, 360),
  standingAt(1460, ground, 290),
];

const shelter = { x: 1000, y: ground - 440, w: 560, h: 480 };
const corner = 26;
const shelterPath = [
  `M${shelter.x + corner} ${shelter.y}`,
  `H${shelter.x + shelter.w - corner}`,
  `A${corner} ${corner} 0 0 1 ${shelter.x + shelter.w} ${shelter.y + corner}`,
  `V${shelter.y + shelter.h - corner}`,
  `A${corner} ${corner} 0 0 1 ${shelter.x + shelter.w - corner} ${shelter.y + shelter.h}`,
  `H${shelter.x + corner}`,
  `A${corner} ${corner} 0 0 1 ${shelter.x} ${shelter.y + shelter.h - corner}`,
  `V${shelter.y + corner}`,
  `A${corner} ${corner} 0 0 1 ${shelter.x + corner} ${shelter.y}`,
  "Z",
].join(" ");

const locked = { from: 0.45, releaseAt: 2.2 };

// You and the people with you: found by the machine, then drawn around by
// something you build yourselves, and the locks let go.
function OurSolution({ designing }: { designing: boolean }) {
  return (
    <div className="absolute inset-0">
      {household.map((place, index) => (
        <div key={place.x}>
          <Person place={place} shown={designing} delay={index * 0.12} />
          <Lock place={place} shown={designing} delay={locked.from + index * 0.16} />
        </div>
      ))}
      <svg className="absolute inset-0 size-full" viewBox="0 0 1920 1080" aria-hidden>
        <motion.path
          d={shelterPath}
          fill="none"
          stroke="var(--color-ink)"
          strokeWidth="4"
          strokeDasharray="14 12"
          initial={false}
          animate={{ pathLength: designing ? 1 : 0, opacity: designing ? 1 : 0 }}
          transition={{ duration: 1.4, ease: sceneEase, delay: designing ? locked.releaseAt - 0.5 : 0 }}
        />
      </svg>
    </div>
  );
}

function Person({ place, shown, delay }: { place: Placement; shown: boolean; delay: number }) {
  return (
    <motion.div
      className="absolute left-0 top-0 origin-top-left"
      style={{ width: figureSize.w, height: figureSize.h, x: place.x, y: place.y, scale: place.scale }}
      initial={false}
      animate={{ opacity: shown ? 1 : 0 }}
      transition={{ duration: 0.6, ease: sceneEase, delay: shown ? delay : 0 }}
      aria-hidden
    >
      <Figure className="size-full" />
    </motion.div>
  );
}

function Lock({ place, shown, delay }: { place: Placement; shown: boolean; delay: number }) {
  const width = figureSize.w * place.scale;
  const height = figureSize.h * place.scale;
  return (
    <motion.div
      className="absolute"
      style={{ left: place.x - 16, top: place.y - 12, width: width + 32, height: height + 24 }}
      initial={false}
      animate={shown ? { opacity: [0, 1, 1, 0], scale: [1.15, 1, 1, 1.55] } : { opacity: 0, scale: 1.15 }}
      transition={
        shown
          ? { duration: locked.releaseAt + 1.5 - delay, times: [0, 0.12, 0.6, 1], ease: sceneEase, delay }
          : { duration: 0.3 }
      }
      aria-hidden
    >
      <Brackets arm={44} weight={5} />
    </motion.div>
  );
}
