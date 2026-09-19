"use client";

import { motion } from "motion/react";
import { sceneEase, sceneMove } from "../motion";
import { Brackets } from "../parts/Brackets";
import type { Beat } from "../script";

const members = ["Brendan Giang", "Matthew Carlin", "Alex Tully", "Christine Wu", "Ada Morris"];

const huntPath = {
  x: [1180, 420, 760, 1320, 560, 1180],
  y: [210, 300, 640, 520, 180, 210],
};

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
      <InfraredFlare />
      <HuntingReticle />
      <ul className="type-label absolute bottom-[110px] left-[150px] flex gap-14 text-[34px] font-medium text-ink-muted">
        {members.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
    </motion.div>
  );
}

function InfraredFlare() {
  return (
    <motion.div
      className="absolute left-0 top-[260px] size-[560px] rounded-full mix-blend-screen"
      style={{
        background:
          "radial-gradient(closest-side, oklch(1 0 0) 0%, oklch(1 0 0 / 0.85) 28%, oklch(1 0 0 / 0.25) 60%, transparent)",
      }}
      animate={{ x: [-200, 1500, -200], scale: [0.9, 1.1, 0.9] }}
      transition={{ duration: 14, ease: "easeInOut", repeat: Infinity }}
      aria-hidden
    />
  );
}

function HuntingReticle() {
  return (
    <motion.div
      className="absolute left-0 top-0 h-[260px] w-[220px]"
      animate={huntPath}
      transition={{ duration: 16, ease: "easeInOut", repeat: Infinity, times: [0, 0.2, 0.4, 0.6, 0.8, 1] }}
      aria-hidden
    >
      <Brackets arm={36} weight={3} />
      <span className="type-osd animate-rec absolute -top-10 left-0 text-mark">Searching</span>
    </motion.div>
  );
}
