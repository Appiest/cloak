"use client";

import { motion } from "motion/react";
import { quickFade, sceneEase } from "../motion";
import { SourceStack, type SourceBlock } from "../parts/SourceStack";
import type { Beat } from "../script";
import { sources } from "../sources";

const plot = { left: 100, right: 1820, baseline: 880, top: 200 };
const plotWidth = plot.right - plot.left;
const plotHeight = plot.baseline - plot.top;

const firstYear = 2011;
const lastYear = 2027;
const tickYears = [2011, 2015, 2020, 2025];

const beatSources: Partial<Record<Beat, SourceBlock>> = {
  protections: { list: [sources.gaoPrivacyLaw, sources.airbnbCameraBan], left: plot.left, width: 900 },
};

function yearToX(year: number): number {
  return plot.left + ((year - firstYear) / (lastYear - firstYear)) * plotWidth;
}

// Capability compounds; protection barely moves. The distance between them is the point.
function capabilityAt(progress: number): number {
  return progress ** 2.6;
}

function protectionAt(progress: number): number {
  return progress * 0.11;
}

const samples = Array.from({ length: 49 }, (_, index) => index / 48);

function curve(height: (progress: number) => number): string {
  return samples
    .map((progress, index) => {
      const x = Math.round(plot.left + progress * plotWidth);
      const y = Math.round(plot.baseline - height(progress) * plotHeight);
      return `${index === 0 ? "M" : "L"}${x} ${y}`;
    })
    .join(" ");
}

const capabilityPath = curve(capabilityAt);
const protectionPath = curve(protectionAt);

const gapArea = `${capabilityPath} L${plot.right} ${Math.round(plot.baseline - protectionAt(1) * plotHeight)} ${[...samples]
  .reverse()
  .map((progress) => `L${Math.round(plot.left + progress * plotWidth)} ${Math.round(plot.baseline - protectionAt(progress) * plotHeight)}`)
  .join(" ")} Z`;

const endOf = (height: (progress: number) => number) => ({
  x: plot.right,
  y: Math.round(plot.baseline - height(1) * plotHeight),
});

export function Timeline({ beat }: { beat: Beat }) {
  const rising = beat === "watchers" || beat === "protections";
  const showingGap = beat === "protections";
  return (
    <div className="pointer-events-none absolute inset-0">
      <motion.div initial={false} animate={{ opacity: rising ? 1 : 0 }} transition={quickFade}>
        <Axis />
        <Plot rising={rising} showingGap={showingGap} />
        <CurveLabel at={endOf(capabilityAt)} visible={rising} delay={1.5} className="text-mark">
          What can watch you
        </CurveLabel>
        <CurveLabel at={endOf(protectionAt)} visible={showingGap} delay={1.2} className="text-ink-muted">
          What protects you
        </CurveLabel>
      </motion.div>
      <SourceStack beat={beat} blocks={beatSources} />
    </div>
  );
}

function Axis() {
  return (
    <>
      <div className="absolute h-px bg-line/50" style={{ left: plot.left, width: plotWidth, top: plot.baseline }} />
      {tickYears.map((year) => (
        <span
          key={year}
          className="type-osd absolute text-[20px] text-ink-faint"
          style={{ left: yearToX(year) - 24, top: plot.baseline + 22 }}
        >
          {year}
        </span>
      ))}
    </>
  );
}

function Plot({ rising, showingGap }: { rising: boolean; showingGap: boolean }) {
  return (
    <svg className="absolute inset-0 size-full" viewBox="0 0 1920 1080" aria-hidden>
      <defs>
        <pattern id="lag-hatch" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(135)">
          <line x1="0" y1="0" x2="0" y2="16" stroke="var(--color-mark)" strokeWidth="2" opacity="0.28" />
        </pattern>
      </defs>
      <motion.path
        d={gapArea}
        fill="url(#lag-hatch)"
        initial={false}
        animate={{ opacity: showingGap ? 1 : 0 }}
        transition={{ duration: 0.8, ease: sceneEase, delay: showingGap ? 0.5 : 0 }}
      />
      <motion.path
        d={protectionPath}
        stroke="var(--color-ink-muted)"
        strokeWidth="4"
        fill="none"
        initial={false}
        animate={{ pathLength: showingGap ? 1 : 0 }}
        transition={{ duration: 1.1, ease: sceneEase }}
      />
      <motion.path
        d={capabilityPath}
        stroke="var(--color-mark)"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
        style={{ filter: "drop-shadow(0 0 16px var(--color-mark-glow))" }}
        initial={false}
        animate={{ pathLength: rising ? 1 : 0 }}
        transition={{ duration: 1.8, ease: sceneEase, delay: rising ? 0.3 : 0 }}
      />
    </svg>
  );
}

type CurveLabelProps = {
  at: { x: number; y: number };
  visible: boolean;
  delay: number;
  className: string;
  children: string;
};

function CurveLabel({ at, visible, delay, className, children }: CurveLabelProps) {
  return (
    <motion.span
      className={`type-label absolute text-[34px] ${className}`}
      style={{ left: at.x - 420, top: at.y - 56, width: 400, textAlign: "right" }}
      initial={false}
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 10 }}
      transition={{ ...quickFade, delay: visible ? delay : 0 }}
    >
      {children}
    </motion.span>
  );
}
