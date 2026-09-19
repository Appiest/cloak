"use client";

import { motion } from "motion/react";
import { sceneEase, sceneMove } from "../motion";
import { figureSize } from "../geometry";
import { Brackets } from "../parts/Brackets";
import { Cap } from "../parts/Cap";
import { Figure } from "../parts/Figure";
import type { Beat } from "../script";
import { walkStart } from "./WalkHome";

const members = ["Brendan Giang", "Matthew Carlin", "Alex Tully", "Christine Wu", "Ada Morris"];

const loop = { duration: 12, ease: "easeInOut", repeat: Infinity } as const;

const person = walkStart;
const lock = { x: 1400, y: 300, width: 300, height: 640 };
const roaming = { width: 220, height: 260 };

const huntTimes = [0, 0.12, 0.24, 0.34, 0.4, 0.72, 0.8, 0.9, 1];
const huntPath = {
  x: [1180, 420, 760, 1150, lock.x, lock.x, 900, 560, 1180],
  y: [210, 300, 560, 420, lock.y, lock.y, 200, 520, 210],
  width: [roaming.width, roaming.width, roaming.width, roaming.width, lock.width, lock.width, roaming.width, roaming.width, roaming.width],
  height: [roaming.height, roaming.height, roaming.height, roaming.height, lock.height, lock.height, roaming.height, roaming.height, roaming.height],
};

const labelTimes = [0, 0.39, 0.41, 0.7, 0.72, 1];
const searchingLabel = [1, 1, 0, 0, 1, 1];
const personLabel = [0, 0, 1, 1, 0, 0];

const presenceTimes = [0, 0.64, 0.66, 0.67, 0.69, 0.71, 0.9, 1];
const presence = [1, 1, 0.2, 0.9, 0.1, 0, 0, 1];

const capTimes = [0, 0.43, 0.49, 0.72, 0.73, 1];
const capDrop = { opacity: [0, 0, 1, 1, 0, 0], y: [-90, -90, 0, 0, -90, -90] };

const activationTimes = [0, 0.53, 0.54, 0.55, 0.56, 0.72, 0.73, 1];
const ledsLit = [0, 0, 1, 0.3, 1, 1, 0, 0];

const bloomTimes = [0, 0.56, 0.62, 0.72, 0.73, 1];
const bloom = { opacity: [0, 0, 1, 1, 0, 0], scale: [0.4, 0.4, 1, 1, 0.4, 0.4] };

const linearLoop = (times: number[]) => ({ ...loop, ease: "linear", times }) as const;

export function Title({ beat }: { beat: Beat }) {
  const visible = beat === "title";
  return (
    <motion.div
      className="pointer-events-none absolute inset-0"
      initial={false}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: visible ? 0.7 : 0.3, ease: sceneEase }}
    >
      <motion.h2
        className="type-display absolute left-[140px] top-[250px] text-[520px] text-figure"
        initial={false}
        animate={{ y: visible ? 0 : -60 }}
        transition={sceneMove}
      >
        Cloak
      </motion.h2>
      <CloakedPerson />
      <HuntingReticle />
      <ul className="type-label absolute bottom-[110px] left-[150px] flex gap-14 text-[34px] font-medium text-ink-muted">
        {members.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
    </motion.div>
  );
}

function HuntingReticle() {
  return (
    <motion.div
      className="absolute left-0 top-0"
      animate={huntPath}
      transition={{ ...loop, times: huntTimes }}
      aria-hidden
    >
      <Brackets arm={36} weight={3} />
      <motion.span className="absolute -top-10 left-0" animate={{ opacity: searchingLabel }} transition={linearLoop(labelTimes)}>
        <span className="type-osd animate-rec text-mark">Searching</span>
      </motion.span>
      <motion.span
        className="type-osd absolute -top-10 left-0 text-mark"
        animate={{ opacity: personLabel }}
        transition={linearLoop(labelTimes)}
      >
        Person
      </motion.span>
    </motion.div>
  );
}

function CloakedPerson() {
  return (
    <motion.div
      className="absolute left-0 top-0 origin-top-left"
      style={{ width: figureSize.w, height: figureSize.h, x: person.x, y: person.y, scale: person.scale }}
      animate={{ opacity: presence }}
      transition={linearLoop(presenceTimes)}
      aria-hidden
    >
      <Figure className="absolute inset-0 size-full" />
      <motion.div
        className="absolute rounded-full mix-blend-screen"
        style={{
          left: 123 - 60,
          top: 92 - 50,
          width: 120,
          height: 100,
          background: "radial-gradient(closest-side, oklch(1 0 0) 40%, oklch(1 0 0 / 0.45) 70%, transparent)",
        }}
        animate={bloom}
        transition={linearLoop(bloomTimes)}
      />
      <motion.div
        className="absolute inset-0"
        animate={capDrop}
        transition={{ ...loop, ease: "easeOut", times: capTimes, opacity: linearLoop(capTimes) }}
      >
        <Cap className="absolute inset-0 size-full" ledColor="var(--color-cap-shade)" />
        <motion.div className="absolute inset-0" animate={{ opacity: ledsLit }} transition={linearLoop(activationTimes)}>
          <Cap glowing className="size-full" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
