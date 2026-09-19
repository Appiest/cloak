"use client";

import { motion } from "motion/react";
import { PosedRig } from "../parts/Rig";
import { handOf, restPose, type Pose } from "../parts/skeleton";

type Glare = { x: number; y: number; r: number };

type Seat = { left: number; top: number; scale: number };

function onScreen(seat: Seat, point: { x: number; y: number }) {
  return { x: seat.left + point.x * seat.scale, y: seat.top + point.y * seat.scale };
}

function faceOf(seat: Seat): Glare {
  const head = onScreen(seat, { x: 100, y: 58 });
  return { ...head, r: 32 * seat.scale };
}

const rigBox = (seat: Seat) => ({ left: seat.left, top: seat.top, width: 200 * seat.scale, height: 520 * seat.scale });

export const bedroomFace: Glare = { x: 196, y: 262, r: 22 };

export function Bedroom() {
  return (
    <svg viewBox="0 0 581 464" className="absolute inset-0 size-full">
      <rect x="250" y="56" width="150" height="120" fill="oklch(0.36 0.02 250 / 0.4)" />
      <path d="M325 56V176M250 116H400" stroke="var(--color-feed)" strokeWidth="6" />
      <path d="M250 176L180 330H520L400 176Z" fill="oklch(0.6 0.02 250 / 0.05)" />
      <rect x="92" y="200" width="26" height="200" fill="var(--color-feed-raised)" />
      <rect x="110" y="300" width="420" height="70" fill="var(--color-feed-raised)" />
      <rect x="110" y="370" width="420" height="16" fill="oklch(0.17 0 0)" />
      <path d="M130 292C130 268 160 262 196 266C236 270 250 282 244 300H130Z" fill="oklch(0.5 0 0)" />
      <circle cx={bedroomFace.x} cy={bedroomFace.y} r={bedroomFace.r} fill="var(--color-figure)" />
      <motion.path
        d="M214 300C216 270 238 256 270 258C300 260 318 276 338 280C380 288 420 262 470 270C505 276 526 290 528 302H214Z"
        fill="oklch(0.42 0.01 250)"
        style={{ originY: "302px" }}
        animate={{ scaleY: [1, 1.025, 1] }}
        transition={{ duration: 4.2, ease: "easeInOut", repeat: Infinity }}
      />
      <rect x="40" y="300" width="46" height="86" fill="oklch(0.17 0 0)" />
      <rect x="50" y="290" width="26" height="8" fill="oklch(0.75 0.03 250)" style={{ filter: "drop-shadow(0 0 8px oklch(0.75 0.03 250))" }} />
    </svg>
  );
}

const washingHair: Pose = {
  ...restPose,
  frontArm: { upper: -158, lower: -100 },
  backArm: { upper: 14, lower: -10 },
};

const showerSeat: Seat = { left: 236, top: 118, scale: 300 / 520 };
export const showerFace = faceOf(showerSeat);
const showerHead = { x: 300, y: 70 };

export function Shower() {
  return (
    <>
      <div
        className="absolute inset-0 opacity-35"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-line) 1px, transparent 1px), linear-gradient(90deg, var(--color-line) 1px, transparent 1px)",
          backgroundSize: "34px 34px",
        }}
      />
      <div className="absolute" style={{ ...rigBox(showerSeat), filter: "blur(4px)" }}>
        <PosedRig pose={washingHair} className="size-full overflow-visible" />
      </div>
      <svg viewBox="0 0 581 464" className="absolute inset-0 size-full">
        <path d={`M${showerHead.x} 20V${showerHead.y - 14}`} stroke="oklch(0.5 0 0)" strokeWidth="6" />
        <path d={`M${showerHead.x - 26} ${showerHead.y}L${showerHead.x - 14} ${showerHead.y - 16}H${showerHead.x + 14}L${showerHead.x + 26} ${showerHead.y}Z`} fill="oklch(0.55 0 0)" />
        {Array.from({ length: 9 }, (_, index) => {
          const spread = (index - 4) * 16;
          return (
            <motion.line
              key={index}
              x1={showerHead.x + spread * 0.3}
              y1={showerHead.y + 4}
              x2={showerHead.x + spread * 1.6}
              y2={440}
              stroke="oklch(0.85 0.02 230 / 0.55)"
              strokeWidth="2"
              strokeDasharray="10 16"
              animate={{ strokeDashoffset: [0, -52] }}
              transition={{ duration: 0.35, ease: "linear", repeat: Infinity }}
            />
          );
        })}
      </svg>
      <div
        className="absolute inset-x-0 top-0 h-[150px]"
        style={{ background: "linear-gradient(oklch(0.85 0 0 / 0.22), transparent)" }}
      />
      <div className="absolute left-[168px] top-[40px] h-[410px] w-[272px] bg-[oklch(0.9_0.01_230/0.1)] shadow-[inset_0_0_0_2px_oklch(1_0_0/0.14)] backdrop-blur-[2px]" />
      <div className="absolute left-[468px] top-[150px] h-1.5 w-[90px] bg-line" />
      <div className="absolute left-[480px] top-[156px] h-[120px] w-[64px] bg-[oklch(0.62_0.02_20)]" />
      <div className="absolute left-[180px] top-[446px] h-3 w-[250px] bg-[oklch(0.45_0.02_20)]" />
    </>
  );
}

const lounging: Pose = {
  ...restPose,
  turn: 1,
  frontLeg: { upper: 78, lower: -6 },
  backLeg: { upper: 74, lower: -2 },
  frontArm: { upper: 38, lower: 96 },
  backArm: { upper: 30, lower: 100 },
};

const couchSeat: Seat = { left: 300, top: 88, scale: 0.6 };
const lean = 16;
const couchHead = onScreen(couchSeat, { x: 100, y: 58 });
const couchPivot = onScreen(couchSeat, { x: 100, y: 300 });

function rotateAround(point: { x: number; y: number }, pivot: { x: number; y: number }, degrees: number) {
  const angle = (degrees * Math.PI) / 180;
  const dx = point.x - pivot.x;
  const dy = point.y - pivot.y;
  return { x: pivot.x + dx * Math.cos(angle) - dy * Math.sin(angle), y: pivot.y + dx * Math.sin(angle) + dy * Math.cos(angle) };
}

export const couchFace: Glare = { ...rotateAround(couchHead, couchPivot, lean), r: 32 * couchSeat.scale };
const bookAt = onScreen(couchSeat, handOf(lounging));

export function Couch() {
  return (
    <>
      <div
        className="absolute left-[380px] top-[20px] size-[280px] rounded-full"
        style={{ background: "radial-gradient(closest-side, oklch(0.9 0.04 80 / 0.16), transparent)" }}
      />
      <div className="absolute left-[536px] top-[100px] h-[340px] w-2 bg-feed-raised" />
      <div className="absolute left-[506px] top-[86px] h-7 w-16 bg-[oklch(0.7_0.04_80)]" />
      <div className="absolute left-[60px] top-[180px] h-[140px] w-[460px] rounded-t-[30px] bg-feed-raised" />
      <div className="absolute left-[380px] top-[218px] h-[90px] w-[110px] -rotate-12 rounded-[24px] bg-[oklch(0.33_0_0)]" />
      <div className="absolute left-[40px] top-[300px] h-[80px] w-[500px] bg-[oklch(0.3_0_0)]" />
      <div className="absolute left-[24px] top-[236px] h-[144px] w-[64px] rounded-t-[26px] bg-feed-raised" />
      <div
        className="absolute"
        style={{ ...rigBox(couchSeat), rotate: `${lean}deg`, transformOrigin: `${100 * couchSeat.scale}px ${300 * couchSeat.scale}px` }}
      >
        <PosedRig pose={lounging} className="size-full overflow-visible" />
        <div
          className="absolute h-[40px] w-[30px] bg-ink-muted"
          style={{ left: bookAt.x - couchSeat.left - 26, top: bookAt.y - couchSeat.top - 34, rotate: "-8deg" }}
        />
      </div>
      <div className="absolute left-[96px] top-[262px] h-[46px] w-[250px] rounded-t-[20px] bg-[oklch(0.4_0.02_250)]" />
    </>
  );
}

const reaching: Pose = {
  ...restPose,
  turn: 1,
  frontArm: { upper: 78, lower: 12 },
  backArm: { upper: 10, lower: 20 },
};

const kitchenSeat: Seat = { left: 236, top: 77, scale: 0.7 };
export const kitchenFace = faceOf(kitchenSeat);

export function Kitchen() {
  return (
    <>
      <div
        className="absolute -left-[60px] top-[0px] h-[464px] w-[420px]"
        style={{ background: "radial-gradient(ellipse 60% 70% at 30% 50%, oklch(0.95 0.02 90 / 0.22), transparent)" }}
      />
      <div className="absolute left-[60px] top-[70px] h-[364px] w-[140px] bg-feed-raised" />
      <div className="absolute left-[72px] top-[84px] h-[336px] w-[116px] bg-[oklch(0.82_0.02_90)]" />
      <div className="absolute left-[72px] top-[190px] h-1 w-[116px] bg-feed-raised" />
      <div className="absolute left-[72px] top-[300px] h-1 w-[116px] bg-feed-raised" />
      <div className="absolute left-[200px] top-[70px] h-[364px] w-[26px] bg-[oklch(0.3_0_0)]" />
      <div className="absolute inset-x-0 top-[433px] h-px bg-line/60" />
      <div className="absolute" style={rigBox(kitchenSeat)}>
        <PosedRig pose={reaching} className="size-full overflow-visible" />
      </div>
    </>
  );
}
