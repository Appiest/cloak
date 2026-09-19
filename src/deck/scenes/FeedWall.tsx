"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { monitorTiles, tileScale, tileSize, wallTiles, type Rect } from "../geometry";
import { pick, pullBack, quickFade, sceneMove } from "../motion";
import { Figure, FigureFromAbove } from "../parts/Figure";
import { Osd } from "../parts/Osd";
import { Waveform } from "../parts/Waveform";
import type { Beat } from "../script";

export type Glare = { x: number; y: number; r: number };

type View = { camera: string; content: ReactNode; face?: Glare };

export const views: View[] = [
  {
    camera: "CAM 02",
    face: { x: 421, y: 239, r: 10 },
    content: (
      <>
        <div className="absolute inset-x-0 top-[372px] h-px bg-line/60" />
        <Figure className="absolute left-[392px] top-[222px] h-[150px]" />
      </>
    ),
  },
  {
    camera: "CAM 03",
    face: { x: 290, y: 232, r: 28 },
    content: (
      <>
        <FloorGrid />
        <FigureFromAbove className="absolute left-[190px] top-[132px] size-[200px]" />
      </>
    ),
  },
  {
    camera: "CAM 04",
    face: { x: 219, y: 226, r: 86 },
    content: <Figure className="absolute left-[-50px] top-[70px] h-[1400px]" />,
  },
  {
    camera: "CAM 05",
    face: { x: 178, y: 173, r: 18 },
    content: <Figure mirrored className="absolute left-[120px] top-[140px] h-[300px] opacity-70" />,
  },
  { camera: "MIC 01", content: <Waveform /> },
];

function FloorGrid() {
  return (
    <div
      className="absolute inset-0 opacity-40"
      style={{
        backgroundImage:
          "linear-gradient(var(--color-line) 1px, transparent 1px), linear-gradient(90deg, var(--color-line) 1px, transparent 1px)",
        backgroundSize: "96px 96px",
        backgroundPosition: "-6px 40px",
      }}
    />
  );
}

const layouts: Partial<Record<Beat, Rect[]>> = {
  everywhere: wallTiles,
  who: monitorTiles,
  demo: wallTiles,
  video: wallTiles,
};

function staggersIn(beat: Beat) {
  return beat === "everywhere" || beat === "demo";
}

export function FeedWall({ beat }: { beat: Beat }) {
  const rects = layouts[beat] ?? wallTiles;
  const visible = beat in layouts;
  const showOsd = pick({ everywhere: 1, who: 1, demo: 1, video: 1 }, beat, 0);
  return (
    <>
      {views.map((view, index) => {
        const rect = rects[index + 1];
        return (
          <motion.div
            key={view.camera}
            className="absolute left-0 top-0 origin-top-left overflow-hidden bg-feed"
            style={{ width: tileSize.w, height: tileSize.h }}
            initial={false}
            animate={{
              x: rect.x,
              y: rect.y,
              scale: tileScale(rect) * (visible ? 1 : 0.9),
              opacity: visible ? 1 : 0,
            }}
            transition={beat === "who" ? pullBack : { ...sceneMove, delay: staggersIn(beat) ? 0.25 + index * 0.1 : 0 }}
          >
            {view.content}
            <div className="absolute inset-0 shadow-[inset_0_0_0_1px_oklch(1_0_0/0.1)]" />
            <motion.div initial={false} animate={{ opacity: showOsd }} transition={quickFade}>
              <Osd camera={view.camera} recording={false} />
            </motion.div>
          </motion.div>
        );
      })}
    </>
  );
}
