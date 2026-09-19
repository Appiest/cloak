"use client";

import { animate, motion, useMotionValue, useTransform, type MotionValue } from "motion/react";
import { useEffect, useId } from "react";
import { canvas, monitorScreen } from "../geometry";
import { pullBack, quickFade } from "../motion";
import type { Beat } from "../script";

const bezel = 22;
const deskTop = monitorScreen.y + monitorScreen.h + 120;
const framedOnScreen = canvas.w / monitorScreen.w;

const dollyAxis = {
  x: (monitorScreen.x * framedOnScreen) / (framedOnScreen - 1),
  y: (monitorScreen.y * framedOnScreen) / (framedOnScreen - 1),
};

const watcherDepth = 0.5;

const exit = { standAt: 4.2, standSeconds: 0.8, walkSeconds: 1.8 };

export function usePullBack(beat: Beat) {
  const roomScale = useMotionValue(framedOnScreen);
  useEffect(() => {
    roomScale.set(framedOnScreen);
    if (beat !== "who") return;
    const controls = animate(roomScale, 1, pullBack);
    return () => controls.stop();
  }, [beat, roomScale]);
  return roomScale;
}

function nearLayerScale(roomScale: number) {
  const distanceToRoom = 1 / roomScale;
  return (1 - watcherDepth) / (distanceToRoom - watcherDepth);
}

function useDolly(scale: MotionValue<number>) {
  const x = useTransform(scale, (k) => dollyAxis.x * (1 - k));
  const y = useTransform(scale, (k) => dollyAxis.y * (1 - k));
  return { x, y, scale };
}

type LayerProps = { beat: Beat; pull: MotionValue<number> };

function useShown(beat: Beat) {
  const visible = beat === "who";
  return { visible, fade: { opacity: visible ? 1 : 0 }, transition: visible ? { duration: 0 } : quickFade };
}

export function WatchRoom({ beat, pull }: LayerProps) {
  const { fade, transition } = useShown(beat);
  const camera = useDolly(pull);
  return (
    <motion.div className="pointer-events-none absolute inset-0" initial={false} animate={fade} transition={transition} aria-hidden>
      <motion.div className="absolute left-0 top-0 origin-top-left" style={{ width: canvas.w, height: canvas.h, ...camera }}>
        <Room />
      </motion.div>
    </motion.div>
  );
}

export function WatchRoomForeground({ beat, pull }: LayerProps) {
  const { visible, fade, transition } = useShown(beat);
  const camera = useDolly(useTransform(pull, nearLayerScale));
  return (
    <motion.div className="pointer-events-none absolute inset-0" initial={false} animate={fade} transition={transition} aria-hidden>
      <motion.div className="absolute left-0 top-0 origin-top-left" style={{ width: canvas.w, height: canvas.h, ...camera }}>
        <Watcher visible={visible} />
        <Chair />
      </motion.div>
    </motion.div>
  );
}

function Room() {
  const glowCenter = `${monitorScreen.x + monitorScreen.w / 2}px ${monitorScreen.y + monitorScreen.h / 2}px`;
  return (
    <>
      <div
        className="absolute bg-stage"
        style={{
          left: -canvas.w,
          top: -canvas.h,
          width: canvas.w * 3,
          height: canvas.h * 3,
          background: `radial-gradient(ellipse 1100px 760px at ${glowCenter}, oklch(0.9 0 0 / 0.08), transparent) ${canvas.w}px ${canvas.h}px / ${canvas.w}px ${canvas.h}px no-repeat, var(--color-stage)`,
        }}
      />
      <SideMonitor />
      <div
        className="absolute bg-feed-raised"
        style={{
          left: monitorScreen.x - bezel,
          top: monitorScreen.y - bezel,
          width: monitorScreen.w + bezel * 2,
          height: monitorScreen.h + bezel * 2,
        }}
      />
      <div
        className="absolute bg-redacted"
        style={{ left: monitorScreen.x, top: monitorScreen.y, width: monitorScreen.w, height: monitorScreen.h }}
      />
      <div
        className="absolute bg-feed-raised"
        style={{ left: monitorScreen.x + monitorScreen.w / 2 - 34, top: monitorScreen.y + monitorScreen.h + bezel, width: 68, height: 128 }}
      />
      <div className="absolute bg-feed" style={{ left: -1200, right: -1200, top: deskTop, height: 1400 }} />
      <div className="absolute h-px bg-line/40" style={{ left: -1200, right: -1200, top: deskTop }} />
      <div
        className="absolute h-20"
        style={{
          left: -1200,
          right: -1200,
          top: deskTop,
          background: `radial-gradient(ellipse 700px 80px at ${monitorScreen.x + monitorScreen.w / 2 + 1200}px 0, oklch(0.9 0 0 / 0.08), transparent)`,
        }}
      />
    </>
  );
}

function SideMonitor() {
  const screen = { x: -690, y: 300, w: 620, h: 360 };
  return (
    <>
      <div className="absolute bg-feed-raised" style={{ left: screen.x - 16, top: screen.y - 16, width: screen.w + 32, height: screen.h + 32 }} />
      <div
        className="absolute grid grid-cols-4 gap-1.5 bg-redacted p-1.5"
        style={{ left: screen.x, top: screen.y, width: screen.w, height: screen.h }}
      >
        {Array.from({ length: 12 }, (_, index) => (
          <div key={index} className="bg-feed" />
        ))}
      </div>
    </>
  );
}

const cloak =
  "M-120 1800V990C0 900 150 862 262 842C330 800 352 760 350 700C340 610 362 500 430 420C480 362 548 330 612 318C640 350 700 404 730 470C770 560 772 650 748 724C742 748 752 768 780 782C940 812 1170 858 1330 950C1430 1010 1500 1090 1530 1800Z";

function Watcher({ visible }: { visible: boolean }) {
  const lightId = useId();
  const total = exit.standAt + exit.standSeconds + exit.walkSeconds;
  return (
    <motion.div
      className="absolute inset-0"
      initial={false}
      animate={visible ? { x: [0, 0, -60, -2400], y: [0, 0, -560, -540] } : { x: 0, y: 0 }}
      transition={
        visible
          ? {
              duration: total,
              times: [0, exit.standAt / total, (exit.standAt + exit.standSeconds) / total, 1],
              ease: ["linear", "easeOut", "easeIn"],
            }
          : { duration: 0 }
      }
    >
      <motion.div
        className="absolute inset-0 origin-bottom"
        initial={false}
        animate={visible ? { y: [0, -6, 0], rotate: [0, 0.6, 0] } : { y: 0, rotate: 0 }}
        transition={{ duration: 3.4, ease: "easeInOut", repeat: Infinity }}
      >
        <svg viewBox="0 0 1920 1080" className="absolute inset-0 size-full overflow-visible">
          <defs>
            <linearGradient id={lightId} x1="0" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox">
              <stop offset="0" stopColor="oklch(0.035 0 0)" />
              <stop offset="0.42" stopColor="oklch(0.05 0 0)" />
              <stop offset="0.52" stopColor="oklch(0.1 0.005 250)" />
              <stop offset="0.6" stopColor="oklch(0.045 0 0)" />
              <stop offset="1" stopColor="oklch(0.07 0.005 250)" />
            </linearGradient>
          </defs>
          <path
            d={cloak}
            transform="translate(1920 0) scale(-1 1) translate(-110 -200) scale(1.05)"
            fill={`url(#${lightId})`}
            style={{ filter: "drop-shadow(-4px -3px 0 oklch(0.62 0.01 250 / 0.5)) drop-shadow(0 0 80px oklch(0.85 0 0 / 0.09))" }}
          />
        </svg>
      </motion.div>
    </motion.div>
  );
}

function Chair() {
  return (
    <svg viewBox="0 0 1920 1080" className="absolute inset-0 size-full overflow-visible">
      <path
        d="M1210 1300V820C1210 760 1250 724 1310 720C1380 716 1520 716 1590 720C1650 724 1690 760 1690 820V1300Z"
        fill="oklch(0.06 0 0)"
        style={{ filter: "drop-shadow(-3px -2px 0 oklch(0.55 0.01 250 / 0.45))" }}
      />
    </svg>
  );
}
