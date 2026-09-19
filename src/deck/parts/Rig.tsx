"use client";

import { motion, useMotionValue, useMotionValueEvent, useTransform, type MotionValue } from "motion/react";
import { useId, useRef, type ReactNode } from "react";
import { bones, joints, type Limb, type Pose } from "./skeleton";

const torso =
  "M86 96C86 104 80 110 68 113C56 116 50 124 50 138L62 300C62 312 138 312 138 300L150 138C150 124 144 116 132 113C120 110 114 104 114 96Z";

type Side = "back" | "front";
type Kind = "arm" | "leg";

const limbBones = {
  arm: { upper: bones.upperArm, lower: bones.forearm },
  leg: { upper: bones.thigh, lower: bones.shin },
};

function limbOf(pose: Pose, side: Side, kind: Kind): Limb {
  const key = `${side}${kind === "arm" ? "Arm" : "Leg"}` as "backArm" | "frontArm" | "backLeg" | "frontLeg";
  return pose[key];
}

function jointOf(pose: Pose, side: Side, kind: Kind) {
  const all = joints(pose.turn);
  const key = `${side}${kind === "arm" ? "Shoulder" : "Hip"}` as keyof typeof all;
  return all[key];
}

function Joint({ transform, children }: { transform: MotionValue<string>; children: ReactNode }) {
  const group = useRef<SVGGElement>(null);
  useMotionValueEvent(transform, "change", (latest) => group.current?.setAttribute("transform", latest));
  return (
    <g ref={group} transform={transform.get()}>
      {children}
    </g>
  );
}

function Capsule({ length, width, fill }: { length: number; width: number; fill: string }) {
  return <rect x={-width / 2} y={-width / 2} width={width} height={length + width} rx={width / 2} fill={fill} />;
}

type LimbProps = { pose: MotionValue<Pose>; side: Side; kind: Kind; fill: string };

function RigLimb({ pose, side, kind, fill }: LimbProps) {
  const sizes = limbBones[kind];
  const upper = useTransform(pose, (current) => {
    const joint = jointOf(current, side, kind);
    return `translate(${joint.x} ${joint.y}) rotate(${limbOf(current, side, kind).upper})`;
  });
  const lower = useTransform(pose, (current) => `translate(0 ${sizes.upper.length}) rotate(${limbOf(current, side, kind).lower})`);
  const footOpacity = useTransform(pose, (current) => current.turn);
  return (
    <Joint transform={upper}>
      <Capsule length={sizes.upper.length} width={sizes.upper.width} fill={fill} />
      <Joint transform={lower}>
        <Capsule length={sizes.lower.length} width={sizes.lower.width} fill={fill} />
        {kind === "leg" && (
          <motion.rect
            x={-30}
            y={sizes.lower.length - 4}
            width={40}
            height={14}
            rx={7}
            fill={fill}
            style={{ opacity: footOpacity }}
          />
        )}
      </Joint>
    </Joint>
  );
}

const paintArea = { x: -120, y: -160, width: 440, height: 800 };

export function Rig({ pose, className }: { pose: MotionValue<Pose>; className?: string }) {
  const id = useId();
  const body = useTransform(pose, (current) => `translate(0 ${current.bob})`);
  const torsoWidth = useTransform(pose, (current) => `translate(100 0) scale(${1 - 0.4 * current.turn} 1) translate(-100 0)`);
  const backShade = useTransform(pose, (current) => `brightness(${1 - 0.35 * current.turn})`);
  const ink = "white";
  return (
    <svg viewBox="0 0 200 520" className={className} overflow="visible" aria-hidden>
      <defs>
        <linearGradient id={`${id}-light`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="520">
          <stop offset="0" stopColor="var(--color-figure)" />
          <stop offset="1" stopColor="var(--color-figure-shade)" />
        </linearGradient>
        <mask id={`${id}-back`} maskUnits="userSpaceOnUse" {...paintArea}>
          <Joint transform={body}>
            <RigLimb pose={pose} side="back" kind="arm" fill={ink} />
            <RigLimb pose={pose} side="back" kind="leg" fill={ink} />
          </Joint>
        </mask>
        <mask id={`${id}-front`} maskUnits="userSpaceOnUse" {...paintArea}>
          <Joint transform={body}>
            <Joint transform={torsoWidth}>
              <path d={torso} fill={ink} />
            </Joint>
            <circle cx="100" cy="58" r="32" fill={ink} />
            <RigLimb pose={pose} side="front" kind="leg" fill={ink} />
            <RigLimb pose={pose} side="front" kind="arm" fill={ink} />
          </Joint>
        </mask>
      </defs>
      <motion.rect {...paintArea} fill={`url(#${id}-light)`} mask={`url(#${id}-back)`} style={{ filter: backShade }} />
      <rect {...paintArea} fill={`url(#${id}-light)`} mask={`url(#${id}-front)`} />
    </svg>
  );
}

export function PosedRig({ pose, className }: { pose: Pose; className?: string }) {
  const value = useMotionValue(pose);
  return <Rig pose={value} className={className} />;
}
