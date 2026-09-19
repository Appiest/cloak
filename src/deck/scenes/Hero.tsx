"use client";

import { motion } from "motion/react";
import { figureSize, heroInside, standingAt, thumbTiles, wallTiles, type Placement } from "../geometry";
import { pick, quickFade, sceneEase, sceneMove } from "../motion";
import { Brackets } from "../parts/Brackets";
import { Figure } from "../parts/Figure";
import { countedHero } from "./Counted";
import { manipulatedHero } from "./Manipulated";
import { infraredHero } from "./Infrared";
import { revealHero } from "./Reveal";
import { ultrasonicHero } from "./Ultrasonic";
import { Cap } from "../parts/Cap";
import { isAtOrAfter, type Beat } from "../script";

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
  ...revealHero,
  ...infraredHero,
  ...ultrasonicHero,
  demo: heroInside(wallTiles[0]),
};

const hiddenOn: Partial<Record<Beat, boolean>> = { title: true, watchers: true, protections: true };

const losingLock = {
  animate: { opacity: [0, 1, 1, 0], scale: [1.12, 1, 1, 1.12] },
  transition: { duration: 2.4, times: [0, 0.2, 0.6, 1], delay: 0.6 },
};

function detection(beat: Beat) {
  if (beat === "demo") return losingLock;
  const detected = pick({ watched: 1, everywhere: 1, reality: 1 }, beat, 0);
  return { animate: { opacity: detected, scale: detected ? 1 : 1.12 }, transition: quickFade };
}

export function Hero({ beat }: { beat: Beat }) {
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
      <CapLayer beat={beat} />
      <motion.div
        className="absolute -inset-x-10 -inset-y-8"
        initial={false}
        {...detection(beat)}
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

function CapLayer({ beat }: { beat: Beat }) {
  const wearing = isAtOrAfter(beat, "capOn");
  return (
    <motion.div
      className="absolute inset-0"
      initial={false}
      animate={{ opacity: wearing ? 1 : 0, y: wearing ? 0 : -70 }}
      transition={{ duration: 0.8, ease: sceneEase, delay: beat === "capOn" ? 0.7 : 0 }}
    >
      <Cap className="size-full" glowing={wearing} />
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
