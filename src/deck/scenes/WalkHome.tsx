"use client";

import { Microphone } from "@phosphor-icons/react";
import { animate, motion, useMotionValue, useTransform, type MotionValue } from "motion/react";
import { useEffect, useRef } from "react";
import { monitorScale, monitorTiles, pointOnFigure, standingAt, wallTiles, type Placement, type Rect } from "../geometry";
import { moveFor, quickFade, sceneEase } from "../motion";
import { Noise } from "../parts/Noise";
import type { Beat } from "../script";

const street = { groundY: 880, height: 280, centerX: 960 };

export const streetScale = street.height / 640;

export const walkStart = standingAt(1550, 900, 560);
const onStreet = standingAt(street.centerX, street.groundY, street.height);

export const walkHero = {
  title: walkStart,
  alone: onStreet,
  watched: onStreet,
  unseen: onStreet,
} satisfies Partial<Record<Beat, Placement>>;

type Leg = { from: number; to: number };

const legs: Partial<Record<Beat, Leg>> = {
  alone: { from: 0, to: 560 },
  watched: { from: 560, to: 1100 },
  unseen: { from: 1100, to: 1640 },
  everywhere: { from: 1640, to: 1710 },
};

const feedBeats: Beat[] = ["everywhere", "who"];

const walkingSpeed = 80;
const catchUpSpeed = 200;

const walkOrder: Beat[] = ["alone", "watched", "unseen", "everywhere"];

function continuesWalk(from: Beat | undefined, to: Beat) {
  if (!from) return false;
  const previous = walkOrder.indexOf(from);
  return previous >= 0 && walkOrder.indexOf(to) === previous + 1;
}

function paceFrom(leg: Leg, position: number) {
  return position < leg.from ? catchUpSpeed : walkingSpeed;
}

const homeStretch = 1640;

export function isWalking(beat: Beat) {
  return beat in legs;
}

function isStreetShown(beat: Beat) {
  return isWalking(beat) || feedBeats.includes(beat);
}

const cropRegion = { x: 522, y: 380, w: 876, h: 700 };

type Frame = { clip: Rect; scale: number };

function frameFor(beat: Beat): Frame {
  const fullFrame = { clip: { x: 0, y: 0, w: 1920, h: 1080 }, scale: 1 };
  if (beat === "everywhere") return { clip: wallTiles[0], scale: wallTiles[0].w / cropRegion.w };
  if (beat === "who") return { clip: monitorTiles[0], scale: (wallTiles[0].w / cropRegion.w) * monitorScale };
  return fullFrame;
}

function croppedBy(frame: Frame) {
  const cropped = frame.scale !== 1;
  const origin = cropped ? cropRegion : { x: 0, y: 0 };
  return {
    clip: { x: frame.clip.x, y: frame.clip.y, width: frame.clip.w, height: frame.clip.h },
    inner: { x: -origin.x * frame.scale, y: -origin.y * frame.scale, scale: frame.scale },
  };
}

export function streetFeedPlacement(beat: Beat): Placement {
  const frame = frameFor(beat);
  const { clip, inner } = croppedBy(frame);
  return {
    x: clip.x + inner.x + onStreet.x * frame.scale,
    y: clip.y + inner.y + onStreet.y * frame.scale,
    scale: onStreet.scale * frame.scale,
  };
}

const doorway = { opens: 0.4, stepsIn: 0.5, closes: 0.5 };

export function useFrontDoor(beat: Beat, travel: MotionValue<number>) {
  const presence = useMotionValue(1);
  const doorOpen = useMotionValue(0);
  useEffect(() => {
    if (beat === "who") {
      // The camera keeps dollying for 5.5s here, so the figure and the door
      // have to finish on a curve too. Snapping them reads as a separate,
      // much faster move and breaks the single-shot illusion.
      const settling = { duration: 0.7, ease: sceneEase };
      const leaving = animate(presence, 0, settling);
      const shutting = animate(doorOpen, 0, settling);
      return () => [leaving, shutting].forEach((controls) => controls.stop());
    }
    if (beat !== "everywhere") {
      presence.set(1);
      doorOpen.set(0);
      return;
    }
    const leg = legs.everywhere!;
    const arrival = Math.max(0, (leg.to - travel.get()) / paceFrom(leg, travel.get()));
    const opening = animate(doorOpen, 1, { duration: doorway.opens, delay: arrival, ease: sceneEase });
    const entering = animate(presence, 0, { duration: doorway.stepsIn, delay: arrival + doorway.opens, ease: "easeIn" });
    const closing = animate(doorOpen, 0, { duration: doorway.closes, delay: arrival + doorway.opens + doorway.stepsIn + 0.2, ease: sceneEase });
    return () => [opening, entering, closing].forEach((controls) => controls.stop());
  }, [beat, travel, presence, doorOpen]);
  return { presence, doorOpen };
}

export function useStreetTravel(beat: Beat) {
  const travel = useMotionValue(0);
  const cameFrom = useRef<Beat>(undefined);
  useEffect(() => {
    const leg = legs[beat];
    const previous = cameFrom.current;
    cameFrom.current = beat;
    if (!leg) return;
    if (!continuesWalk(previous, beat)) travel.set(leg.from);
    const remaining = leg.to - travel.get();
    const controls = animate(travel, leg.to, {
      duration: remaining / paceFrom(leg, travel.get()),
      ease: "linear",
    });
    return () => controls.stop();
  }, [beat, travel]);
  return travel;
}

const head = pointOnFigure(onStreet, 100, 58);
const headRadius = pointOnFigure(onStreet, 132, 58).x - head.x;
const mouth = pointOnFigure(onStreet, 88, 74);

type Watcher = { x: number; y: number; size: number };

const cameras: Watcher[] = [
  { x: -1500, y: 180, size: 90 },
  { x: -1150, y: 430, size: 80 },
  { x: -800, y: 140, size: 100 },
  { x: -450, y: 320, size: 90 },
  { x: -150, y: 120, size: 110 },
  { x: 250, y: 400, size: 80 },
  { x: 600, y: 170, size: 100 },
  { x: 950, y: 440, size: 80 },
];

const microphones = [
  { x: -1300, y: 520 },
  { x: -620, y: 250 },
  { x: 80, y: 560 },
  { x: 700, y: 300 },
];

const lampPosts = [-2100, -1400, -700, 0, 700, 1400];

const house = { doorX: street.centerX - 70 - homeStretch, width: 480, height: 460 };

function screenX(worldX: number, travelled: number) {
  return worldX + travelled;
}

function aimAngle(camera: Watcher, travelled: number) {
  const x = screenX(camera.x, travelled);
  const degrees = (Math.atan2(head.y - camera.y, head.x - x) * 180) / Math.PI;
  return Math.round(degrees * 100) / 100;
}

function viewCone(camera: Watcher, travelled: number) {
  const x = screenX(camera.x, travelled);
  const dx = head.x - x;
  const dy = head.y - camera.y;
  const length = Math.hypot(dx, dy);
  const along = { x: dx / length, y: dy / length };
  const reach = camera.size * 0.36;
  const lens = { x: x + along.x * reach, y: camera.y + along.y * reach };
  const spread = headRadius * 1.4;
  const left = { x: head.x - along.y * spread, y: head.y + along.x * spread };
  const right = { x: head.x + along.y * spread, y: head.y - along.x * spread };
  return `M${lens.x} ${lens.y} L${left.x} ${left.y} L${right.x} ${right.y} Z`;
}

function listeningLine(worldX: number, y: number, travelled: number) {
  return `M${screenX(worldX, travelled) + 28} ${y + 28} L${mouth.x} ${mouth.y}`;
}

type WalkHomeProps = { beat: Beat; travel: MotionValue<number>; doorOpen: MotionValue<number> };

export function WalkHome({ beat, travel, doorOpen }: WalkHomeProps) {
  const visible = isStreetShown(beat);
  const watching = beat !== "alone";
  const listening = beat !== "alone" && beat !== "watched";
  const { clip, inner } = croppedBy(frameFor(beat));
  const move = moveFor(beat);
  return (
    <motion.div
      className="pointer-events-none absolute left-0 top-0 overflow-hidden bg-stage"
      initial={false}
      animate={{ ...clip, opacity: visible ? 1 : 0 }}
      transition={{ ...move, opacity: { duration: 0.8, ease: sceneEase } }}
      aria-hidden
    >
      <motion.div
        className="absolute left-0 top-0 h-[1080px] w-[1920px] origin-top-left"
        initial={false}
        animate={inner}
        transition={move}
      >
      <Ground travel={travel} />
      <motion.div className="absolute inset-0" style={{ x: travel }}>
        {lampPosts.map((x) => (
          <LampPost key={x} x={x} />
        ))}
        <House doorOpen={doorOpen} />
      </motion.div>
      <svg className="absolute inset-0 size-full" viewBox="0 0 1920 1080">
        {cameras.map((camera, index) => (
          <ViewCone key={camera.x} camera={camera} travel={travel} visible={watching} order={index} />
        ))}
        {microphones.map((microphone, index) => (
          <ListeningLine key={microphone.x} {...microphone} travel={travel} visible={listening} order={index} />
        ))}
      </svg>
      <motion.div className="absolute inset-0" style={{ x: travel }}>
        {cameras.map((camera, index) => (
          <FloatingCamera key={camera.x} camera={camera} travel={travel} visible={watching} order={index} />
        ))}
        {microphones.map((microphone, index) => (
          <ListeningMicrophone key={microphone.x} {...microphone} visible={listening} order={index} />
        ))}
      </motion.div>
      </motion.div>
    </motion.div>
  );
}

function Ground({ travel }: { travel: MotionValue<number> }) {
  const backgroundPositionX = useTransform(travel, (travelled) => `${travelled}px`);
  return (
    <>
      <div className="absolute inset-x-0 h-px bg-line/60" style={{ top: street.groundY }} />
      <motion.div
        className="absolute inset-x-0 h-2 opacity-40"
        style={{
          top: street.groundY + 36,
          backgroundImage: "repeating-linear-gradient(90deg, var(--color-line) 0 60px, transparent 60px 160px)",
          backgroundPositionX,
        }}
      />
    </>
  );
}

function LampPost({ x }: { x: number }) {
  return (
    <div className="absolute" style={{ left: x - 4, top: street.groundY - 420, width: 8, height: 420 }}>
      <div className="absolute inset-0 bg-feed-raised" />
      <div className="absolute -left-4 -top-2 h-3 w-10 bg-feed-raised" />
      <div
        className="absolute -left-24 -top-6 size-52 rounded-full"
        style={{ background: "radial-gradient(closest-side, oklch(1 0 0 / 0.08), transparent)" }}
      />
    </div>
  );
}

function House({ doorOpen }: { doorOpen: MotionValue<number> }) {
  const doorWidth = useTransform(doorOpen, (open) => 80 * (1 - 0.85 * open));
  return (
    <svg
      className="absolute"
      style={{ left: house.doorX - house.width / 2, top: street.groundY - house.height, width: house.width, height: house.height }}
      viewBox="0 0 480 460"
    >
      <path d="M30 200 L240 40 L450 200 V460 H30 Z" fill="var(--color-feed-raised)" />
      <path d="M0 214 L240 26 L480 214" fill="none" stroke="var(--color-line)" strokeWidth="8" />
      <rect x="200" y="300" width="80" height="160" fill="var(--color-stage)" />
      <motion.rect x="200" y="300" height="160" fill="oklch(0.3 0 0)" style={{ width: doorWidth }} />
      <rect x="340" y="260" width="70" height="70" fill="var(--color-ink-muted)" opacity="0.45" />
      <rect x="70" y="260" width="70" height="70" fill="var(--color-ink-muted)" opacity="0.45" />
    </svg>
  );
}

type CameraProps = { camera: Watcher; travel: MotionValue<number>; visible: boolean; order: number };

function ViewCone({ camera, travel, visible, order }: CameraProps) {
  const d = useTransform(travel, (travelled) => viewCone(camera, travelled));
  return (
    <motion.path
      d={d}
      fill="var(--color-mark-glow)"
      fillOpacity={0.12}
      initial={false}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ ...quickFade, delay: visible ? 0.8 + order * 0.2 : 0 }}
    />
  );
}

function FloatingCamera({ camera, travel, visible, order }: CameraProps) {
  const rotate = useTransform(travel, (travelled) => aimAngle(camera, travelled));
  return (
    <motion.div
      className="absolute left-0 top-0"
      style={{ x: camera.x - camera.size / 2, y: camera.y - camera.size / 2, width: camera.size, height: camera.size }}
      initial={false}
      animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.25 }}
      transition={visible ? { type: "spring", duration: 0.5, bounce: 0, delay: 0.5 + order * 0.2 } : quickFade}
    >
      <motion.div className="size-full" style={{ rotate }}>
        <CameraBody />
      </motion.div>
    </motion.div>
  );
}

function CameraBody() {
  return (
    <svg viewBox="0 0 100 100" className="size-full overflow-visible">
      <rect x="18" y="36" width="58" height="28" fill="var(--color-figure)" />
      <rect x="76" y="40" width="10" height="20" fill="var(--color-figure-shade)" />
      <circle cx="86" cy="50" r="6" fill="var(--color-mark)" style={{ filter: "drop-shadow(0 0 4px var(--color-mark))" }} />
      <rect x="10" y="42" width="8" height="16" fill="var(--color-figure-shade)" />
    </svg>
  );
}

type MicrophoneProps = { x: number; y: number; visible: boolean; order: number };

function ListeningLine({ x, y, travel, visible, order }: MicrophoneProps & { travel: MotionValue<number> }) {
  const d = useTransform(travel, (travelled) => listeningLine(x, y, travelled));
  return (
    <motion.path
      d={d}
      stroke="var(--color-mark)"
      strokeWidth={2}
      strokeDasharray="6 8"
      fill="none"
      initial={false}
      animate={{ opacity: visible ? 0.7 : 0 }}
      transition={{ ...quickFade, delay: visible ? 0.8 + order * 0.25 : 0 }}
    />
  );
}

function ListeningMicrophone({ x, y, visible, order }: MicrophoneProps) {
  return (
    <motion.div
      className="absolute flex items-center gap-3 text-ink-muted"
      style={{ left: x, top: y }}
      initial={false}
      animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.25 }}
      transition={visible ? { type: "spring", duration: 0.5, bounce: 0, delay: 0.5 + order * 0.25 } : quickFade}
    >
      <Microphone size={56} weight="regular" />
      <div className="h-8 w-24">{visible && <Noise count={14} className="size-full" />}</div>
    </motion.div>
  );
}
