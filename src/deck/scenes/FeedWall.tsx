"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { thumbTiles, tileScale, tileSize, wallTiles, type Rect } from "../geometry";
import { pick, quickFade, sceneEase } from "../motion";
import { Figure, FigureFromAbove } from "../parts/Figure";
import { Osd } from "../parts/Osd";
import { Waveform } from "../parts/Waveform";
import type { Beat } from "../script";

type View = { camera: string; content: ReactNode };

const views: View[] = [
  {
    camera: "CAM 02",
    content: (
      <>
        <div className="absolute inset-x-0 top-[372px] h-px bg-line/60" />
        <Figure className="absolute left-[392px] top-[222px] h-[150px]" />
      </>
    ),
  },
  {
    camera: "CAM 03",
    content: (
      <>
        <FloorGrid />
        <FigureFromAbove className="absolute left-[190px] top-[132px] size-[200px]" />
      </>
    ),
  },
  {
    camera: "CAM 04",
    content: <Figure className="absolute left-[-50px] top-[70px] h-[1400px]" />,
  },
  {
    camera: "CAM 05",
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
  who: thumbTiles,
};

export function FeedWall({ beat }: { beat: Beat }) {
  const rects = layouts[beat] ?? wallTiles;
  const visible = beat in layouts;
  const showOsd = pick({ everywhere: 1 }, beat, 0);
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
            transition={{
              duration: 1.1,
              ease: sceneEase,
              delay: beat === "everywhere" ? 0.25 + index * 0.1 : 0,
            }}
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
