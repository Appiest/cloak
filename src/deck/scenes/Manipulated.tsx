"use client";

import { AnimatePresence, motion } from "motion/react";
import { figureSize, standingAt, type Placement } from "../geometry";
import { pick, quickFade, sceneEase, sceneMove } from "../motion";
import { CountUp } from "../parts/CountUp";
import { Figure } from "../parts/Figure";
import { SourceNote } from "../parts/SourceNote";
import { Waveform } from "../parts/Waveform";
import type { Beat } from "../script";
import { sources } from "../sources";

const spotted = 0.73;

export const splitBar = { x: 100, y: 700, w: 1720, h: 56 };
const missedCenterX = splitBar.x + splitBar.w * (spotted + (1 - spotted) / 2);

export const manipulatedHero = {
  cloned: standingAt(560, 700, 420),
  undetected: standingAt(300, splitBar.y - 24, 220),
} satisfies Partial<Record<Beat, Placement>>;

const clonePlacements: Partial<Record<Beat, Placement>> = {
  cloned: standingAt(1360, 700, 420),
  undetected: standingAt(missedCenterX, splitBar.y - 24, 220),
};

export function Manipulated({ beat }: { beat: Beat }) {
  const cloning = beat === "cloned";
  const measuring = beat === "undetected";
  return (
    <div className="pointer-events-none absolute inset-0">
      <Clone beat={beat} />
      <VoicePair visible={cloning} />
      <AnimatePresence>
        {cloning && (
          <motion.figure
            key="quote"
            className="absolute inset-x-[260px] top-[90px] text-center"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ ...quickFade, delay: cloning ? 0.9 : 0 }}
          >
            <blockquote className="type-label text-ink" style={{ textWrap: "balance" }}>
              “All he needs is a short audio clip of your family member’s voice — which he could get from content
              posted online — and a voice-cloning program.”
            </blockquote>
            <figcaption className="type-source mt-4 text-ink-muted">US Federal Trade Commission, 2023</figcaption>
          </motion.figure>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {measuring && (
          <motion.div
            key="stat"
            className="absolute left-[100px] top-[110px] w-[1100px]"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={quickFade}
          >
            <p className="type-display text-[220px] text-ink">
              <CountUp value={73} suffix="%" />
            </p>
            <p className="type-label mt-4 max-w-[900px] text-ink-muted" style={{ textWrap: "balance" }}>
              is how often 529 listeners correctly spotted a deepfake voice when asked to find it
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      <SourceLine beat={beat} />
    </div>
  );
}

function Clone({ beat }: { beat: Beat }) {
  const placement = clonePlacements[beat];
  return (
    <motion.div
      className="absolute left-0 top-0 origin-top-left"
      style={{ width: figureSize.w, height: figureSize.h }}
      initial={{ ...manipulatedHero.cloned, opacity: 0 }}
      animate={placement ? { ...placement, opacity: 1 } : { opacity: 0 }}
      transition={{ ...sceneMove, delay: beat === "cloned" ? 0.3 : 0 }}
    >
      <Figure synthetic className="size-full" />
    </motion.div>
  );
}

function VoicePair({ visible }: { visible: boolean }) {
  return (
    <motion.div
      className="absolute inset-0"
      initial={false}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.6, ease: sceneEase, delay: visible ? 0.5 : 0 }}
    >
      <div className="absolute left-[360px] top-[760px] h-[150px] w-[400px]">
        <Waveform />
      </div>
      <div className="absolute left-[1160px] top-[760px] h-[150px] w-[400px]">
        <Waveform barClassName="bg-mark" />
      </div>
      <svg className="absolute inset-0 size-full" viewBox="0 0 1920 1080" aria-hidden>
        {visible &&
          [0, 1, 2, 3].map((pulse) => (
            <motion.circle
              key={pulse}
              r={6}
              fill="var(--color-mark)"
              initial={{ cx: 790, cy: 835, opacity: 0 }}
              animate={{ cx: 1130, opacity: [0, 1, 1, 0] }}
              transition={{ duration: 1.6, ease: "linear", repeat: Infinity, delay: 1 + pulse * 0.4 }}
            />
          ))}
      </svg>
    </motion.div>
  );
}

export function SplitBar({ beat }: { beat: Beat }) {
  const measuring = beat === "undetected";
  const axis = beat === "watchers" || beat === "protections";
  const opacity = pick({ undetected: 1, watchers: 1, protections: 1 }, beat, 0);
  return (
    <motion.div
      className="absolute left-0 top-0 flex"
      initial={false}
      animate={{
        opacity,
        x: splitBar.x,
        y: axis ? timelineAxisY : splitBar.y,
        width: splitBar.w,
        height: axis ? 4 : splitBar.h,
      }}
      transition={sceneMove}
    >
      <motion.div
        className="relative h-full origin-left bg-line"
        style={{ width: `${spotted * 100}%` }}
        initial={false}
        animate={{ scaleX: opacity ? 1 : 0 }}
        transition={{ ...sceneMove, delay: measuring ? 0.3 : 0 }}
      >
        <BarLabel visible={measuring} className="left-0">
          Spotted
        </BarLabel>
      </motion.div>
      <motion.div
        className="relative h-full flex-1"
        initial={false}
        animate={{ opacity: opacity ? 1 : 0 }}
        style={{
          background: axis
            ? "var(--color-line)"
            : "repeating-linear-gradient(135deg, var(--color-mark) 0 10px, transparent 10px 20px)",
        }}
        transition={{ ...quickFade, delay: measuring ? 1.2 : 0 }}
      >
        <BarLabel visible={measuring} className="right-0 text-mark">
          Missed
        </BarLabel>
      </motion.div>
    </motion.div>
  );
}

export const timelineAxisY = 560;

function BarLabel({ visible, className, children }: { visible: boolean; className: string; children: string }) {
  return (
    <motion.span
      className={`type-label absolute top-[76px] whitespace-nowrap text-[32px] text-ink-muted ${className}`}
      initial={false}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ ...quickFade, delay: visible ? 1.4 : 0 }}
    >
      {children}
    </motion.span>
  );
}

function SourceLine({ beat }: { beat: Beat }) {
  const source = pick({ cloned: sources.ftcVoiceCloning, undetected: sources.deepfakeDetection }, beat, undefined);
  return (
    <AnimatePresence mode="wait">
      {source && (
        <motion.div
          key={source.url}
          className="absolute bottom-[64px] left-[100px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={quickFade}
        >
          <SourceNote source={source} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
