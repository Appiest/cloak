"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { monitorTiles, tileScale, tileSize, wallTiles, type Rect } from "../geometry";
import { pick, pullBack, quickFade, sceneMove } from "../motion";
import { Osd } from "../parts/Osd";
import { Waveform } from "../parts/Waveform";
import type { Beat } from "../script";
import { Bedroom, bedroomFace, Couch, couchFace, Kitchen, kitchenFace, Shower, showerFace } from "./PrivateScenes";

export type Glare = { x: number; y: number; r: number };

type View = { camera: string; content: ReactNode; face?: Glare };

export const views: View[] = [
  { camera: "CAM 02", face: bedroomFace, content: <Bedroom /> },
  { camera: "CAM 03", face: showerFace, content: <Shower /> },
  { camera: "CAM 04", face: couchFace, content: <Couch /> },
  { camera: "CAM 05", face: kitchenFace, content: <Kitchen /> },
  { camera: "MIC 01", content: <Waveform /> },
];

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
