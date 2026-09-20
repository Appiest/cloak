"use client";

import { motion, type Easing } from "motion/react";
import { figureSize, standingAt } from "../geometry";
import { pick, sceneEase } from "../motion";
import { Brackets } from "../parts/Brackets";
import { Cap } from "../parts/Cap";
import { Figure } from "../parts/Figure";
import type { Beat } from "../script";

type Row = { count: number; feetY: number; height: number; tone: number; skipCenter: boolean };

const rows: Row[] = [
  { count: 27, feetY: 330, height: 58, tone: 0.2, skipCenter: false },
  { count: 23, feetY: 445, height: 84, tone: 0.32, skipCenter: false },
  { count: 19, feetY: 580, height: 120, tone: 0.48, skipCenter: false },
  { count: 15, feetY: 745, height: 172, tone: 0.72, skipCenter: false },
  { count: 10, feetY: 950, height: 242, tone: 1, skipCenter: true },
];

function jitter(seed: number): number {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

const people = rows.flatMap((row, rowIndex) => {
  const spacing = 1920 / row.count;
  return Array.from({ length: row.count }, (_, index) => {
    const drift = jitter(rowIndex * 53 + index * 7) - 0.5;
    return {
      id: `${rowIndex}-${index}`,
      index,
      tone: Math.round(row.tone * (1 + drift * 0.22) * 1000) / 1000,
      feetY: Math.round(row.feetY + drift * 52),
      height: Math.round(row.height * (1 + drift * 0.16)),
      centerX: Math.round(spacing * (index + 0.5) + (jitter(rowIndex * 31 + index) - 0.5) * spacing * 0.75),
      mirrored: jitter(index * 7 + rowIndex) > 0.5,
    };
  }).filter((person) => !(row.skipCenter && person.index === Math.floor(row.count / 2)));
});

const pullBackFrom = 2.6;
const pullBackSeconds = 2.8;

// The caps light as a wave travelling out from the hero, so the room turns
// over in one move instead of everyone popping at random.
const waveOrigin = { x: 960, y: 960 };
const waveSpeed = 1500;

function waveDelay(centerX: number, feetY: number): number {
  return Math.hypot(centerX - waveOrigin.x, feetY - waveOrigin.y) / waveSpeed;
}

// Hold while the caps light, fly forward through the crowd, then settle back
// out onto all of them. The bloom peaks as the camera returns, so the reset is
// hidden inside the flash and the slide lands on people, not on an empty frame.
const flyThrough = {
  animate: { opacity: [1, 1, 1, 1], scale: [1, 1.06, 2.6, 1] },
  transition: {
    duration: 3.6,
    times: [0, 0.3, 0.68, 1],
    ease: ["easeInOut", "easeIn", "easeOut"] satisfies Easing[],
  },
};

export function Crowd({ beat }: { beat: Beat }) {
  const presence = pick({ reality: 1, whatNow: 0.14, flock: 1, together: 1 }, beat, 0);
  const watched = beat === "reality" || beat === "flock";
  const capped = beat === "together";
  const released = capped;
  const amongThem = beat === "who";
  return (
    <motion.div
      className="absolute inset-0"
      initial={false}
      animate={capped ? flyThrough.animate : { opacity: presence ? 1 : 0, scale: amongThem ? pullBackFrom : 1 }}
      transition={
        capped
          ? flyThrough.transition
          : { duration: 0.8, ease: sceneEase, scale: { duration: pullBackSeconds, ease: sceneEase } }
      }
      aria-hidden
    >
      {people.map((person, order) => {
        const place = standingAt(person.centerX, person.feetY, person.height);
        return (
          <motion.div
            key={person.id}
            className="absolute left-0 top-0 origin-top-left"
            style={{ width: figureSize.w, height: figureSize.h, x: place.x, y: place.y, scale: place.scale }}
            initial={false}
            animate={{ opacity: presence * person.tone }}
            transition={{ duration: 0.8, ease: sceneEase, delay: watched ? 0.25 + order * 0.012 : 0 }}
          >
            <Figure mirrored={person.mirrored} className="size-full" />
            <motion.div
              className="absolute inset-0"
              initial={false}
              animate={{ opacity: capped ? 1 : 0, y: capped ? 0 : -60 }}
              transition={{
                duration: 0.45,
                ease: sceneEase,
                delay: capped ? 0.35 + waveDelay(person.centerX, person.feetY) : 0,
              }}
            >
              <Cap className="size-full" glowing={capped} />
            </motion.div>
            <motion.div
              className="absolute -inset-x-10 -inset-y-8"
              initial={false}
              animate={{ opacity: watched ? 1 : 0, scale: watched ? 1 : released ? 1.6 : 1.15 }}
              transition={{
                duration: released ? 0.5 : 0.4,
                ease: sceneEase,
                delay: bracketDelay(watched, released, order, person),
              }}
            >
              <Brackets arm={70} weight={10} />
            </motion.div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

function bracketDelay(watched: boolean, released: boolean, order: number, person: { centerX: number; feetY: number }) {
  if (watched) return 1.4 + jitter(order) * 1.5;
  if (released) return 0.3 + waveDelay(person.centerX, person.feetY);
  return 0;
}
