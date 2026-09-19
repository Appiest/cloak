"use client";

import { motion } from "motion/react";
import { monitorScreen } from "../geometry";
import { quickFade, sceneEase, sceneMove } from "../motion";
import type { Beat } from "../script";

const bezel = 18;
const deskTop = monitorScreen.y + monitorScreen.h + 130;

const exit = { seconds: 7.2, times: [0, 0.5, 0.625, 1] };

export function WatchRoom({ beat }: { beat: Beat }) {
  const visible = beat === "who";
  return (
    <motion.div
      className="pointer-events-none absolute inset-0"
      initial={false}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ ...sceneMove, delay: visible ? 0.2 : 0 }}
      aria-hidden
    >
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 900px 620px at ${monitorScreen.x + monitorScreen.w / 2}px ${monitorScreen.y + monitorScreen.h / 2}px, oklch(1 0 0 / 0.07), transparent)`,
        }}
      />
      <div
        className="absolute bg-feed-raised"
        style={{
          left: monitorScreen.x - bezel,
          top: monitorScreen.y - bezel,
          width: monitorScreen.w + bezel * 2,
          height: monitorScreen.h + bezel * 2,
        }}
      />
      <div className="absolute bg-redacted" style={{ left: monitorScreen.x, top: monitorScreen.y, width: monitorScreen.w, height: monitorScreen.h }} />
      <div
        className="absolute bg-feed-raised"
        style={{ left: monitorScreen.x + monitorScreen.w / 2 - 30, top: monitorScreen.y + monitorScreen.h + bezel, width: 60, height: 112 }}
      />
      <div
        className="absolute bg-feed-raised"
        style={{ left: monitorScreen.x + monitorScreen.w / 2 - 160, top: deskTop - 14, width: 320, height: 14 }}
      />
      <div className="absolute inset-x-0 bottom-0 bg-feed" style={{ top: deskTop }} />
      <div className="absolute inset-x-0 h-px bg-line/50" style={{ top: deskTop }} />
    </motion.div>
  );
}

export function WatchRoomForeground({ beat }: { beat: Beat }) {
  const visible = beat === "who";
  return (
    <motion.div
      className="pointer-events-none absolute inset-0"
      initial={false}
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 160 }}
      transition={visible ? { ...sceneMove, delay: 0.3 } : quickFade}
      aria-hidden
    >
      <Watcher visible={visible} />
      <Chair visible={visible} />
    </motion.div>
  );
}

function Watcher({ visible }: { visible: boolean }) {
  return (
    <motion.div
      className="absolute left-[380px] top-[500px] h-[700px] w-[600px]"
      initial={false}
      animate={visible ? { x: [0, 0, 0, 1800], y: [0, 0, -170, -150] } : { x: 0, y: 0 }}
      transition={visible ? { duration: exit.seconds, times: exit.times, ease: sceneEase, delay: 1.2 } : { duration: 0 }}
    >
      <motion.div
        className="size-full"
        initial={false}
        animate={visible ? { y: [0, -10, 0] } : { y: 0 }}
        transition={{ duration: 0.55, repeat: Infinity, ease: "easeInOut", delay: 1.2 + exit.seconds * exit.times[2] }}
      >
        <svg viewBox="0 0 600 700" className="size-full overflow-visible">
          <path
            d="M300 40C220 40 170 100 165 180C160 250 180 300 200 330C120 350 40 390 20 470L0 700H600L580 470C560 390 480 350 400 330C420 300 440 250 435 180C430 100 380 40 300 40Z"
            fill="oklch(0.09 0 0)"
            style={{ filter: "drop-shadow(0 -2px 0 oklch(0.55 0 0 / 0.7)) drop-shadow(0 0 40px oklch(0.8 0 0 / 0.12))" }}
          />
        </svg>
      </motion.div>
    </motion.div>
  );
}

function Chair({ visible }: { visible: boolean }) {
  return (
    <motion.div
      className="absolute left-[470px] top-[780px] h-[340px] w-[420px] origin-bottom"
      initial={false}
      animate={visible ? { x: [0, 0, 30, 30], rotate: [0, 0, -4, 0] } : { x: 0, rotate: 0 }}
      transition={visible ? { duration: exit.seconds, times: exit.times, ease: sceneEase, delay: 1.2 } : { duration: 0 }}
    >
      <svg viewBox="0 0 420 340" className="size-full">
        <path d="M30 80C30 30 70 0 120 0H300C350 0 390 30 390 80V340H30Z" fill="var(--color-cap-shade)" />
        <path d="M60 90C60 50 90 30 130 30H290C330 30 360 50 360 90" fill="none" stroke="var(--color-feed-raised)" strokeWidth="6" />
      </svg>
    </motion.div>
  );
}
