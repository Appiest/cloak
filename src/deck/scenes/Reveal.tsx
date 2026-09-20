"use client";

import { motion } from "motion/react";
import { pointOnFigure, productStage, type Placement } from "../geometry";
import { quickFade, sceneEase } from "../motion";
import { capAnchors } from "../parts/Cap";
import type { Beat } from "../script";

export const revealHero = {
  capOn: productStage,
  parts: productStage,
} satisfies Partial<Record<Beat, Placement>>;

type Side = "left" | "right";

type Callout = {
  title: string;
  side: Side;
  box: { x: number; y: number };
  target: { x: number; y: number };
};

const callouts: Callout[] = [
  {
    title: "Infrared LEDs in the brim",
    side: "left",
    box: { x: 100, y: 420 },
    target: capAnchors.led,
  },
  {
    title: "Ultrasonic transducers in the band",
    side: "right",
    box: { x: 1340, y: 260 },
    target: capAnchors.transducer,
  },
];

const calloutWidth = 480;

const sides: Record<Side, { anchorOffset: number; textAlign: "left" | "right" }> = {
  left: { anchorOffset: calloutWidth, textAlign: "right" },
  right: { anchorOffset: 0, textAlign: "left" },
};

export function Reveal({ beat }: { beat: Beat }) {
  const labelling = beat === "parts";
  return (
    <div className="pointer-events-none absolute inset-0">
      {callouts.map((callout, index) => (
        <CalloutMark key={callout.title} callout={callout} visible={labelling} order={index} />
      ))}
    </div>
  );
}

function CalloutMark({ callout, visible, order }: { callout: Callout; visible: boolean; order: number }) {
  const target = pointOnFigure(revealHero.parts, callout.target.x, callout.target.y);
  const { anchorOffset, textAlign } = sides[callout.side];
  const anchor = { x: callout.box.x + anchorOffset, y: callout.box.y + 24 };
  const delay = visible ? 1 + order * 0.5 : 0;
  return (
    <>
      <svg className="absolute inset-0 size-full" viewBox="0 0 1920 1080" aria-hidden>
        <motion.path
          d={`M${anchor.x} ${anchor.y} L${target.x} ${target.y}`}
          stroke="var(--color-ink-muted)"
          strokeWidth={2}
          fill="none"
          initial={false}
          animate={{ pathLength: visible ? 1 : 0 }}
          transition={{ duration: 0.6, ease: sceneEase, delay }}
        />
        <motion.circle
          cx={target.x}
          cy={target.y}
          r={9}
          fill="none"
          stroke="var(--color-ink)"
          strokeWidth={2}
          initial={false}
          animate={{ opacity: visible ? 1 : 0 }}
          transition={{ ...quickFade, delay: visible ? delay + 0.5 : 0 }}
        />
      </svg>
      <motion.div
        className="absolute"
        style={{ left: callout.box.x, top: callout.box.y, width: calloutWidth }}
        initial={false}
        animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 12 }}
        transition={{ ...quickFade, delay: visible ? delay + 0.3 : 0 }}
      >
        <h3 className="type-label text-[40px] text-ink" style={{ textAlign }}>
          {callout.title}
        </h3>
      </motion.div>
    </>
  );
}
