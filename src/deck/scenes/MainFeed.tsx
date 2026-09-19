"use client";

import { motion } from "motion/react";
import { screenFeed, thumbTiles, wallTiles, type Rect } from "../geometry";
import { pick, quickFade, sceneMove } from "../motion";
import { Brackets } from "../parts/Brackets";
import { Osd } from "../parts/Osd";
import type { Beat } from "../script";

const frames: Partial<Record<Beat, Rect>> = {
  title: screenFeed,
  watched: screenFeed,
  everywhere: wallTiles[0],
  demo: wallTiles[0],
  who: thumbTiles[0],
};

function frameTarget(beat: Beat) {
  const rect = frames[beat] ?? screenFeed;
  return { x: rect.x, y: rect.y, width: rect.w, height: rect.h };
}

export function MainFeedFill({ beat }: { beat: Beat }) {
  const opacity = pick({ everywhere: 1, who: 1, demo: 1 }, beat, 0);
  return (
    <motion.div
      className="absolute left-0 top-0 bg-feed"
      initial={false}
      animate={{ ...frameTarget(beat), opacity }}
      transition={sceneMove}
    />
  );
}

export function MainFeedChrome({ beat }: { beat: Beat }) {
  const visible = beat in frames;
  const showOsd = pick({ title: 1, watched: 1, everywhere: 1, demo: 1 }, beat, 0);
  return (
    <motion.div
      className="absolute left-0 top-0"
      initial={false}
      animate={{ ...frameTarget(beat), opacity: visible ? 1 : 0 }}
      transition={sceneMove}
    >
      <Brackets arm={beat === "who" ? 22 : 44} weight={beat === "who" ? 2 : 3} />
      <motion.div initial={false} animate={{ opacity: showOsd }} transition={quickFade}>
        <Osd camera="CAM 01" />
      </motion.div>
    </motion.div>
  );
}
