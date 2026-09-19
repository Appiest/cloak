"use client";

import { motion } from "motion/react";
import { figureSize, standingAt } from "../geometry";
import { pick, sceneEase } from "../motion";
import { Brackets } from "../parts/Brackets";
import { Figure } from "../parts/Figure";
import type { Beat } from "../script";

type Row = { count: number; feetY: number; height: number; tone: number; skipCenter: boolean };

const rows: Row[] = [
  { count: 20, feetY: 400, height: 80, tone: 0.28, skipCenter: false },
  { count: 15, feetY: 560, height: 120, tone: 0.45, skipCenter: false },
  { count: 12, feetY: 740, height: 170, tone: 0.7, skipCenter: false },
  { count: 9, feetY: 930, height: 230, tone: 1, skipCenter: true },
];

function jitter(seed: number): number {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

const people = rows.flatMap((row, rowIndex) => {
  const spacing = 1920 / row.count;
  return Array.from({ length: row.count }, (_, index) => ({
    id: `${rowIndex}-${index}`,
    index,
    row,
    centerX: spacing * (index + 0.5) + (jitter(rowIndex * 31 + index) - 0.5) * spacing * 0.4,
    mirrored: jitter(index * 7 + rowIndex) > 0.5,
  })).filter((person) => !(row.skipCenter && person.index === Math.floor(row.count / 2)));
});

export function Crowd({ beat }: { beat: Beat }) {
  const presence = pick({ reality: 1, whatNow: 0.14 }, beat, 0);
  const watched = beat === "reality";
  return (
    <motion.div
      className="absolute inset-0"
      initial={false}
      animate={{ opacity: presence ? 1 : 0 }}
      transition={{ duration: 0.8, ease: sceneEase }}
      aria-hidden
    >
      {people.map((person, order) => {
        const place = standingAt(person.centerX, person.row.feetY, person.row.height);
        return (
          <motion.div
            key={person.id}
            className="absolute left-0 top-0 origin-top-left"
            style={{ width: figureSize.w, height: figureSize.h, x: place.x, y: place.y, scale: place.scale }}
            initial={false}
            animate={{ opacity: presence * person.row.tone }}
            transition={{ duration: 0.8, ease: sceneEase, delay: watched ? order * 0.02 : 0 }}
          >
            <Figure mirrored={person.mirrored} className="size-full" />
            <motion.div
              className="absolute -inset-x-10 -inset-y-8"
              initial={false}
              animate={{ opacity: watched ? 1 : 0, scale: watched ? 1 : 1.15 }}
              transition={{ duration: 0.4, ease: sceneEase, delay: watched ? 0.6 + jitter(order) * 1.4 : 0 }}
            >
              <Brackets arm={70} weight={10} />
            </motion.div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
