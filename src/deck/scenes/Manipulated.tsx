"use client";

import { motion } from "motion/react";
import { figureSize, pointOnFigure, standingAt, type Placement } from "../geometry";
import { quickFade, sceneEase, sceneMove } from "../motion";
import { Brackets } from "../parts/Brackets";
import { Figure } from "../parts/Figure";
import type { Beat } from "../script";

// You are nearest the camera and largest; the people around you sit behind and
// smaller, so "closest to you" reads as proximity rather than a lineup.
const you = standingAt(560, 980, 560);
const stolen = standingAt(1400, 930, 500);

const closest: Placement[] = [
  standingAt(250, 880, 360),
  standingAt(830, 900, 395),
  standingAt(1060, 860, 330),
];

export const manipulatedHero = {
  impersonate: you,
  frame: you,
  exploit: you,
} satisfies Partial<Record<Beat, Placement>>;

const yourHead = pointOnFigure(you, 100, 58);
const stolenHead = pointOnFigure(stolen, 100, 58);
const headRadius = pointOnFigure(you, 132, 58).x - yourHead.x;

function useStage(beat: Beat) {
  return {
    impersonating: beat === "impersonate",
    framing: beat === "frame",
    exploiting: beat === "exploit",
    present: beat === "impersonate" || beat === "frame" || beat === "exploit",
  };
}

export function Manipulated({ beat }: { beat: Beat }) {
  const stage = useStage(beat);
  return (
    <div className="pointer-events-none absolute inset-0">
      <StolenBody shown={stage.present} />
      <ClosestPeople shown={stage.exploiting} />
      <LiftedFace stage={stage} />
      <MarkedAsYou shown={stage.framing || stage.exploiting} />
    </div>
  );
}

type Stage = ReturnType<typeof useStage>;

function FigureAt({ place, opacity, delay, synthetic }: { place: Placement; opacity: number; delay: number; synthetic?: boolean }) {
  return (
    <motion.div
      className="absolute left-0 top-0 origin-top-left"
      style={{ width: figureSize.w, height: figureSize.h, x: place.x, y: place.y, scale: place.scale }}
      initial={false}
      animate={{ opacity }}
      transition={{ ...sceneMove, delay }}
    >
      <Figure synthetic={synthetic} className="size-full" />
    </motion.div>
  );
}

function StolenBody({ shown }: { shown: boolean }) {
  return <FigureAt place={stolen} opacity={shown ? 1 : 0} delay={shown ? 0.2 : 0} synthetic />;
}

function ClosestPeople({ shown }: { shown: boolean }) {
  return (
    <>
      {closest.map((place, index) => (
        <div key={place.x}>
          <FigureAt place={place} opacity={shown ? 0.85 : 0} delay={shown ? 0.3 + index * 0.18 : 0} />
          <BracketOn place={place} shown={shown} delay={1.1 + index * 0.22} />
        </div>
      ))}
    </>
  );
}

function BracketOn({ place, shown, delay }: { place: Placement; shown: boolean; delay: number }) {
  const width = figureSize.w * place.scale;
  const height = figureSize.h * place.scale;
  return (
    <motion.div
      className="absolute"
      style={{ left: place.x - 18, top: place.y - 14, width: width + 36, height: height + 28 }}
      initial={false}
      animate={{ opacity: shown ? 1 : 0, scale: shown ? 1 : 1.12 }}
      transition={{ ...quickFade, delay: shown ? delay : 0 }}
    >
      <Brackets arm={52} weight={6} />
    </motion.div>
  );
}

function MarkedAsYou({ shown }: { shown: boolean }) {
  return <BracketOn place={you} shown={shown} delay={0.35} />;
}

const faceTravel = { duration: 1.5, ease: sceneEase, delay: 0.7 };

function LiftedFace({ stage }: { stage: Stage }) {
  const lifted = stage.framing || stage.exploiting || stage.impersonating;
  const landed = stage.framing || stage.exploiting;
  const from = { x: yourHead.x, y: yourHead.y };
  const to = { x: stolenHead.x, y: stolenHead.y };
  return (
    <motion.svg
      className="absolute inset-0 size-full overflow-visible"
      viewBox="0 0 1920 1080"
      initial={false}
      animate={{ opacity: lifted ? 1 : 0 }}
      transition={quickFade}
      aria-hidden
    >
      <motion.g
        initial={false}
        animate={{ x: landed ? to.x - from.x : 0, y: landed ? to.y - from.y : 0 }}
        transition={stage.framing ? faceTravel : { duration: 0 }}
      >
        <ellipse
          cx={from.x}
          cy={from.y}
          rx={headRadius * 1.05}
          ry={headRadius * 1.35}
          fill="none"
          stroke="var(--color-mark)"
          strokeWidth="3"
          style={{ filter: "drop-shadow(0 0 14px var(--color-mark-glow))" }}
        />
        {[-0.5, -0.17, 0.17, 0.5].map((offset) => (
          <line
            key={offset}
            x1={from.x - headRadius * 0.95}
            x2={from.x + headRadius * 0.95}
            y1={from.y + headRadius * 1.3 * offset}
            y2={from.y + headRadius * 1.3 * offset}
            stroke="var(--color-mark)"
            strokeWidth="1.5"
            opacity="0.55"
          />
        ))}
      </motion.g>
    </motion.svg>
  );
}
