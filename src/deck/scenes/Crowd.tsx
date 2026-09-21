"use client";

import { motion } from "motion/react";
import { memo } from "react";
import { figureSize, standingAt, type Placement } from "../geometry";
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
}).map((person) => ({ ...person, place: standingAt(person.centerX, person.feetY, person.height) }));

const pullBackFrom = 2.6;
const pullBackSeconds = 2.8;

// The caps light as a wave travelling out from the hero, so the room turns
// over in one move instead of everyone popping at random.
const waveOrigin = { x: 960, y: 960 };
const waveSpeed = 1500;

function waveDelay(centerX: number, feetY: number): number {
  return Math.hypot(centerX - waveOrigin.x, feetY - waveOrigin.y) / waveSpeed;
}

// One person at the very back, nearest the middle: the camera picks them out
// and closes on them.
const farthest = people
  .filter((person) => person.height <= 70)
  .reduce((best, person) => (Math.abs(person.centerX - 960) < Math.abs(best.centerX - 960) ? person : best));

const focus = { x: farthest.centerX, y: farthest.feetY - farthest.height / 2 };

// A single target rather than keyframes, so an early click retargets from
// wherever the move has got to instead of snapping back to the first frame.
const closeIn = {
  animate: { opacity: 1, scale: 7.5, x: Math.round(960 - focus.x), y: Math.round(540 - focus.y) },
  transition: { duration: 4.4, delay: 1.1, ease: sceneEase },
};

export function Crowd({ beat }: { beat: Beat }) {
  const presence = pick({ reality: 1, whatNow: 0.14, flockNetwork: 0.5, nationwide: 0.5, frontierModels: 0.18, together: 1 }, beat, 0);
  const watched = beat === "reality";
  const capped = beat === "together";
  const released = capped;
  const amongThem = beat === "who";
  return (
    <motion.div
      className="absolute inset-0"
      initial={false}
      style={{ originX: capped ? focus.x / 1920 : 0.5, originY: capped ? focus.y / 1080 : 0.5 }}
      animate={capped ? closeIn.animate : { opacity: presence ? 1 : 0, scale: amongThem ? pullBackFrom : 1, x: 0, y: 0 }}
      transition={
        capped
          ? closeIn.transition
          : { duration: 0.8, ease: sceneEase, scale: { duration: pullBackSeconds, ease: sceneEase } }
      }
      aria-hidden
    >
      {people.map((person, order) => (
        <CrowdPerson
          key={person.id}
          place={person.place}
          mirrored={person.mirrored}
          opacity={capped ? (person.id === farthest.id ? 1 : 0.1) : presence * person.tone}
          enterDelay={capped ? 2 : watched ? 0.25 + order * 0.012 : 0}
          enterDuration={capped ? 2 : 0.8}
          capped={capped}
          capDelay={capped ? 0.35 + waveDelay(person.centerX, person.feetY) : 0}
          watched={watched}
          released={released}
          bracketDelay={bracketDelay(watched, released, order, person)}
        />
      ))}
    </motion.div>
  );
}

function bracketDelay(watched: boolean, released: boolean, order: number, person: { centerX: number; feetY: number }) {
  if (watched) return 1.4 + jitter(order) * 1.5;
  if (released) return 0.3 + waveDelay(person.centerX, person.feetY);
  return 0;
}

type CrowdPersonProps = {
  place: Placement;
  mirrored: boolean;
  opacity: number;
  enterDelay: number;
  enterDuration: number;
  capped: boolean;
  capDelay: number;
  watched: boolean;
  released: boolean;
  bracketDelay: number;
};

// Memoised on primitives and a stable placement. Every scene stays mounted, so
// without this the whole crowd re-renders on every beat change in the deck.
const CrowdPerson = memo(function CrowdPerson(props: CrowdPersonProps) {
  const { place, mirrored, opacity, enterDelay, enterDuration, capped, capDelay, watched, released, bracketDelay } = props;
  return (
    <motion.div
      className="absolute left-0 top-0 origin-top-left"
      style={{ width: figureSize.w, height: figureSize.h, x: place.x, y: place.y, scale: place.scale }}
      initial={false}
      animate={{ opacity }}
      transition={{ duration: enterDuration, ease: sceneEase, delay: enterDelay }}
    >
      <Figure mirrored={mirrored} className="size-full" />
      <motion.div
        className="absolute inset-0"
        initial={false}
        animate={{ opacity: capped ? 1 : 0, y: capped ? 0 : -60 }}
        transition={{ duration: 0.45, ease: sceneEase, delay: capDelay }}
      >
        <Cap className="size-full" glowing={capped} />
      </motion.div>
      <motion.div
        className="absolute -inset-x-10 -inset-y-8"
        initial={false}
        animate={{ opacity: watched ? 1 : 0, scale: watched ? 1 : released ? 1.6 : 1.15 }}
        transition={{ duration: released ? 0.5 : 0.4, ease: sceneEase, delay: bracketDelay }}
      >
        <Brackets arm={70} weight={10} />
      </motion.div>
    </motion.div>
  );
});
