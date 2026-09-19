"use client";

import { motion, useTime, useTransform, type MotionValue } from "motion/react";
import { useSyncExternalStore } from "react";
import { figureSize } from "../geometry";
import { sceneEase, sceneMove } from "../motion";
import { Brackets } from "../parts/Brackets";
import { Cap } from "../parts/Cap";
import { Rig } from "../parts/Rig";
import { smoothPath } from "../parts/smoothPath";
import { handOf, reachFor, restPose, type Limb, type Pose } from "../parts/skeleton";
import type { Beat } from "../script";
import { walkStart } from "./WalkHome";

const members = ["Brendan Giang", "Matthew Carlin", "Alex Tully", "Christine Wu", "Ada Morris"];

const loopMs = 12000;
const person = walkStart;
const lock = { x: 1400, y: 300, width: 300, height: 640 };
const roaming = { width: 220, height: 260 };

const hunt = {
  times: [0, 0.12, 0.24, 0.34, 0.4, 0.84, 0.89, 0.95, 1],
  x: [1180, 420, 760, 1150, lock.x, lock.x, 900, 560, 1180],
  y: [210, 300, 560, 420, lock.y, lock.y, 200, 520, 210],
  width: [roaming.width, roaming.width, roaming.width, roaming.width, lock.width, lock.width, roaming.width, roaming.width, roaming.width],
  height: [roaming.height, roaming.height, roaming.height, roaming.height, lock.height, lock.height, roaming.height, roaming.height, roaming.height],
};

const labels = { times: [0, 0.39, 0.41, 0.82, 0.84, 1], searching: [1, 1, 0, 0, 1, 1], found: [0, 0, 1, 1, 0, 0] };

const capGrip = { x: 136, y: 56 };
const holding: Limb = { upper: -12, lower: 8 };
const raisedOut: Limb = { upper: -95, lower: -12 };
const overhead: Limb = { upper: -168, lower: -18 };
const placing = reachFor(capGrip);
const lowering: Limb = { upper: -60, lower: -8 };
const hanging: Limb = restPose.frontArm;

const arm = {
  times: [0, 0.42, 0.465, 0.515, 0.57, 0.61, 0.655, 0.7, 0.86, 0.88, 1],
  poses: [holding, holding, raisedOut, overhead, placing, placing, lowering, hanging, hanging, holding, holding],
};

const worn = { times: [0, 0.569, 0.57, 0.86, 0.861, 1], values: [0, 0, 1, 1, 0, 0] };
const capTilt = { times: [0, 0.42, 0.515, 0.57, 0.86, 0.861, 1], values: [-28, -28, -8, 0, 0, -28, -28] };
const ledsLit = { times: [0, 0.65, 0.66, 0.67, 0.68, 0.86, 0.861, 1], values: [0, 0, 1, 0.3, 1, 1, 0, 0] };
const bloom = { times: [0, 0.68, 0.74, 0.86, 0.861, 1], opacity: [0, 0, 1, 1, 0, 0], scale: [0.4, 0.4, 1, 1, 0.4, 0.4] };
const presence = { times: [0, 0.76, 0.78, 0.79, 0.81, 0.83, 0.9, 1], values: [1, 1, 0.2, 0.9, 0.1, 0, 0, 1] };

const easeInOut = { ease: (t: number) => t * t * (3 - 2 * t) };
const upperArm = smoothPath(arm.times, arm.poses.map((limb) => limb.upper));
const forearm = smoothPath(arm.times, arm.poses.map((limb) => limb.lower));
const tiltAt = smoothPath(capTilt.times, capTilt.values);

function titlePose(progress: number): Pose {
  return { ...restPose, frontArm: { upper: upperArm(progress), lower: forearm(progress) } };
}

function handAt(progress: number) {
  return handOf(titlePose(progress));
}

const noSubscription = () => () => {};

function useIsBrowser() {
  return useSyncExternalStore(noSubscription, () => true, () => false);
}

function useLoopProgress() {
  const time = useTime();
  return useTransform(time, (elapsed) => (elapsed % loopMs) / loopMs);
}

export function Title({ beat }: { beat: Beat }) {
  const visible = beat === "title";
  const progress = useLoopProgress();
  const inBrowser = useIsBrowser();
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
      {inBrowser && <CloakedPerson progress={progress} />}
      {inBrowser && <HuntingReticle progress={progress} />}
      <ul className="type-label absolute bottom-[110px] left-[150px] flex gap-14 text-[34px] font-medium text-ink-muted">
        {members.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
    </motion.div>
  );
}

type LoopProps = { progress: MotionValue<number> };

function HuntingReticle({ progress }: LoopProps) {
  const x = useTransform(progress, hunt.times, hunt.x, easeInOut);
  const y = useTransform(progress, hunt.times, hunt.y, easeInOut);
  const width = useTransform(progress, hunt.times, hunt.width, easeInOut);
  const height = useTransform(progress, hunt.times, hunt.height, easeInOut);
  const searching = useTransform(progress, labels.times, labels.searching);
  const found = useTransform(progress, labels.times, labels.found);
  return (
    <motion.div className="absolute left-0 top-0" style={{ x, y, width, height }} aria-hidden>
      <Brackets arm={36} weight={3} />
      <motion.span className="absolute -top-10 left-0" style={{ opacity: searching }}>
        <span className="type-osd text-mark">
          Searching<span className="animate-ellipsis inline-block overflow-hidden align-bottom">...</span>
        </span>
      </motion.span>
      <motion.span className="type-osd absolute -top-10 left-0 text-mark" style={{ opacity: found }}>
        Person
      </motion.span>
    </motion.div>
  );
}

const figureUnit = figureSize.w / 200;

function CloakedPerson({ progress }: LoopProps) {
  const pose = useTransform(progress, titlePose);
  const opacity = useTransform(progress, presence.times, presence.values);
  const bloomOpacity = useTransform(progress, bloom.times, bloom.opacity);
  const bloomScale = useTransform(progress, bloom.times, bloom.scale);
  return (
    <motion.div
      className="absolute left-0 top-0 origin-top-left"
      style={{ width: figureSize.w, height: figureSize.h, x: person.x, y: person.y, scale: person.scale, opacity }}
      aria-hidden
    >
      <Rig pose={pose} className="absolute inset-0 size-full overflow-visible" />
      <motion.div
        className="absolute rounded-full mix-blend-screen"
        style={{
          left: 123 - 60,
          top: 92 - 50,
          width: 120,
          height: 100,
          background: "radial-gradient(closest-side, oklch(1 0 0) 40%, oklch(1 0 0 / 0.45) 70%, transparent)",
          opacity: bloomOpacity,
          scale: bloomScale,
        }}
      />
      <HeldCap progress={progress} />
    </motion.div>
  );
}

function HeldCap({ progress }: LoopProps) {
  const onHead = useTransform(progress, worn.times, worn.values);
  const x = useTransform([progress, onHead], ([at, placed]: number[]) => (1 - placed) * (handAt(at).x - capGrip.x) * figureUnit);
  const y = useTransform([progress, onHead], ([at, placed]: number[]) => (1 - placed) * (handAt(at).y - capGrip.y) * figureUnit);
  const rotate = useTransform(progress, tiltAt);
  const lit = useTransform(progress, ledsLit.times, ledsLit.values);
  return (
    <motion.div
      className="absolute inset-0"
      style={{ x, y, rotate, originX: capGrip.x / 200, originY: capGrip.y / 520 }}
    >
      <Cap className="absolute inset-0 size-full" ledColor="var(--color-cap-shade)" />
      <motion.div className="absolute inset-0" style={{ opacity: lit }}>
        <Cap glowing className="size-full" />
      </motion.div>
    </motion.div>
  );
}
