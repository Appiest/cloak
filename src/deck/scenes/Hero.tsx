"use client";

import { motion } from "motion/react";
import { figureSize, heroInside, standingAt, thumbTiles, wallTiles, type Placement } from "../geometry";
import { pick, quickFade, sceneMove } from "../motion";
import { Brackets } from "../parts/Brackets";
import { Figure } from "../parts/Figure";
import { countedHero } from "./Counted";
import { manipulatedHero } from "./Manipulated";
import type { Beat } from "../script";

const center = standingAt(960, 960, 640);

const placements: Record<Beat, Placement> = {
  title: center,
  alone: center,
  watched: center,
  everywhere: heroInside(wallTiles[0]),
  who: heroInside(thumbTiles[0]),
  reality: standingAt(960, 930, 230),
  whatNow: standingAt(960, 1000, 420),
  ...countedHero,
  ...manipulatedHero,
  watchers: manipulatedHero.undetected,
  protections: manipulatedHero.undetected,
};

const hiddenOn: Partial<Record<Beat, boolean>> = { title: true, watchers: true, protections: true };

export function Hero({ beat }: { beat: Beat }) {
  const detected = pick({ watched: 1, everywhere: 1, reality: 1 }, beat, 0);
  const labelled = pick({ watched: 1 }, beat, 0);
  return (
    <motion.div
      className="absolute left-0 top-0 origin-top-left"
      style={{ width: figureSize.w, height: figureSize.h }}
      initial={false}
      animate={{ ...placements[beat], opacity: hiddenOn[beat] ? 0 : 1 }}
      transition={sceneMove}
    >
      <Pool beat={beat} />
      <Figure className="relative size-full" />
      <motion.div
        className="absolute -inset-x-10 -inset-y-8"
        initial={false}
        animate={{ opacity: detected, scale: detected ? 1 : 1.12 }}
        transition={quickFade}
      >
        <Brackets arm={56} weight={4} />
        <motion.span
          className="type-osd absolute -top-12 left-0 text-[28px] text-mark"
          initial={false}
          animate={{ opacity: labelled }}
          transition={quickFade}
        >
          Person
        </motion.span>
      </motion.div>
    </motion.div>
  );
}

function Pool({ beat }: { beat: Beat }) {
  const opacity = pick({ alone: 1, watched: 1, whatNow: 1 }, beat, 0);
  return (
    <motion.div
      className="absolute -bottom-16 left-1/2 h-32 w-[520px] -translate-x-1/2 rounded-[50%]"
      style={{ background: "radial-gradient(closest-side, oklch(1 0 0 / 0.1), transparent)" }}
      initial={false}
      animate={{ opacity }}
      transition={sceneMove}
      aria-hidden
    />
  );
}
