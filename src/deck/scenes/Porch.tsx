"use client";

import { motion, type Transition } from "motion/react";
import { figureSize, wallTiles } from "../geometry";
import { sceneEase, sceneMove } from "../motion";
import type { Beat } from "../script";

const tile = wallTiles[0];

export const porchScale = 0.5;

const door = { x: 150, y: 96, w: 140, h: 344 };
const porchFloor = 440;
const heroWidth = figureSize.w * porchScale;
const heroHeight = figureSize.h * porchScale;

const walkFrom = tile.x + 470 - heroWidth / 2;
const walkTo = tile.x + door.x + door.w / 2 - heroWidth / 2;

const entrance = { total: 5.4, arrive: 1.1, setOff: 1.3, atDoor: 4.3, inside: 4.7, shut: 5.4 };
const at = (seconds: number) => seconds / entrance.total;

export const porchEntrance = {
  animate: {
    x: [null, walkFrom, walkFrom, walkTo],
    y: tile.y + porchFloor - heroHeight,
    scale: porchScale,
    opacity: [1, 1, 0],
  },
  transition: {
    ...sceneMove,
    x: { duration: entrance.total, times: [0, at(entrance.arrive), at(entrance.setOff), at(entrance.atDoor)], ease: ["easeOut", "linear", "linear"] },
    opacity: { duration: entrance.total, times: [0, at(entrance.atDoor), at(entrance.inside)], ease: "linear" },
  } satisfies Transition,
};

export function FrontDoor({ beat }: { beat: Beat }) {
  const entering = beat === "everywhere";
  return (
    <div className="absolute left-0 top-0 h-[464px] w-[581px]" aria-hidden>
      <div className="absolute inset-0 bg-[oklch(0.2_0_0)]" />
      <div
        className="absolute left-[250px] top-[70px] size-[260px] rounded-full"
        style={{ background: "radial-gradient(closest-side, oklch(0.92 0.04 80 / 0.22), transparent)" }}
      />
      <div className="absolute left-[372px] top-[172px] h-6 w-4 bg-[oklch(0.9_0.05_85)] shadow-[0_0_18px_4px_oklch(0.9_0.05_85/0.5)]" />
      <div className="absolute left-[420px] top-[130px] h-[130px] w-[120px] bg-[oklch(0.3_0_0)] shadow-[inset_0_0_0_6px_oklch(0.24_0_0)]" />
      <div className="absolute bg-[oklch(0.12_0_0)]" style={{ left: door.x - 12, top: door.y - 12, width: door.w + 24, height: door.h + 12 }} />
      <div className="absolute bg-stage" style={{ left: door.x, top: door.y, width: door.w, height: door.h }} />
      <motion.div
        className="absolute origin-left bg-[oklch(0.28_0_0)]"
        style={{ left: door.x, top: door.y, width: door.w, height: door.h }}
        initial={false}
        animate={entering ? { scaleX: [0.12, 0.12, 1] } : { scaleX: 1 }}
        transition={entering ? { duration: entrance.shut, times: [0, at(entrance.inside), 1], ease: sceneEase } : { duration: 0 }}
      >
        <div className="absolute right-4 top-1/2 size-3 rounded-full bg-line" />
      </motion.div>
      <div className="absolute inset-x-0 bg-[oklch(0.16_0_0)]" style={{ top: porchFloor, height: 24 }} />
      <div className="absolute inset-x-0 h-px bg-line/60" style={{ top: porchFloor }} />
    </div>
  );
}
