"use client";

import { motion } from "motion/react";
import { monitorScale, monitorTiles, screenFeed, wallTiles, type Rect } from "../geometry";
import { moveFor, pick, quickFade } from "../motion";
import { Brackets } from "../parts/Brackets";
import { Osd } from "../parts/Osd";
import type { Beat } from "../script";

const frames: Partial<Record<Beat, Rect>> = {
  title: screenFeed,
  watched: screenFeed,
  unseen: screenFeed,
  everywhere: wallTiles[0],
  demo: wallTiles[0],
  video: wallTiles[0],
  who: monitorTiles[0],
};

function frameTarget(beat: Beat) {
  if (beat === "who") return onMonitor;
  const rect = frames[beat] ?? screenFeed;
  return { x: rect.x, y: rect.y, width: rect.w, height: rect.h, scale: 1 };
}

const onMonitor = {
  x: monitorTiles[0].x,
  y: monitorTiles[0].y,
  width: wallTiles[0].w,
  height: wallTiles[0].h,
  scale: monitorScale,
};

export function MainFeedFill({ beat }: { beat: Beat }) {
  const opacity = pick({ everywhere: 1, who: 1, demo: 1, video: 1 }, beat, 0);
  return (
    <motion.div
      className="absolute left-0 top-0 origin-top-left overflow-hidden bg-feed"
      initial={false}
      animate={{ ...frameTarget(beat), opacity }}
      transition={moveFor(beat)}
    >
      <Hallway />
    </motion.div>
  );
}

function Hallway() {
  return (
    <svg viewBox="0 0 581 464" className="absolute left-0 top-0 h-[464px] w-[581px]" aria-hidden>
      <rect x="180" y="52" width="220" height="388" fill="var(--color-stage)" />
      <path d="M172 440V44H408V440" fill="none" stroke="var(--color-feed-raised)" strokeWidth="10" />
      <rect x="440" y="210" width="16" height="26" fill="var(--color-feed-raised)" />
      <path d="M70 150h60M84 150v26M116 150v26" stroke="var(--color-feed-raised)" strokeWidth="6" />
      <path d="M0 440H581" stroke="var(--color-line)" strokeOpacity="0.6" />
    </svg>
  );
}

export function MainFeedChrome({ beat }: { beat: Beat }) {
  const visible = beat in frames;
  const showOsd = pick({ title: 1, watched: 1, unseen: 1, everywhere: 1, who: 1, demo: 1, video: 1 }, beat, 0);
  return (
    <motion.div
      className="absolute left-0 top-0 origin-top-left"
      initial={false}
      animate={{ ...frameTarget(beat), opacity: visible ? 1 : 0 }}
      transition={moveFor(beat)}
    >
      <Brackets arm={44} weight={3} />
      <motion.div initial={false} animate={{ opacity: showOsd }} transition={quickFade}>
        <Osd camera="CAM 01" />
      </motion.div>
    </motion.div>
  );
}
