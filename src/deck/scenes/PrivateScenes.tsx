"use client";

import { motion } from "motion/react";
import { Figure } from "../parts/Figure";
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

export const bedroomFace: Glare = { x: 178, y: 286, r: 24 };

export function Bedroom() {
  return (
    <svg viewBox="0 0 581 464" className="absolute inset-0 size-full">
      <rect x="70" y="60" width="130" height="130" fill="oklch(0.4 0.02 250 / 0.35)" />
      <path d="M135 60V190M70 125H200" stroke="var(--color-feed)" strokeWidth="6" />
      <path d="M200 190L330 420H40L70 190Z" fill="oklch(0.6 0.02 250 / 0.05)" />
      <rect x="96" y="230" width="30" height="160" fill="var(--color-feed-raised)" />
      <rect x="120" y="320" width="400" height="60" fill="var(--color-feed-raised)" />
      <ellipse cx="170" cy="308" rx="48" ry="16" fill="var(--color-figure-shade)" />
      <circle cx={bedroomFace.x} cy={bedroomFace.y} r={bedroomFace.r} fill="var(--color-figure)" />
      <motion.path
        d="M200 322C240 290 300 286 350 300C400 312 440 300 480 306C505 310 520 318 520 330H200Z"
        fill="var(--color-line)"
        style={{ originY: "330px" }}
        animate={{ scaleY: [1, 1.08, 1] }}
        transition={{ duration: 3.6, ease: "easeInOut", repeat: Infinity }}
      />
    </svg>
  );
}

const showerSeat: Seat = { left: 252, top: 112, scale: 300 / 520 };
export const showerFace = faceOf(showerSeat);

export function Shower() {
  return (
    <>
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-line) 1px, transparent 1px), linear-gradient(90deg, var(--color-line) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />
      <div className="absolute left-[290px] top-[50px] h-4 w-16 bg-feed-raised" />
      <div className="absolute" style={{ ...rigBox(showerSeat), filter: "blur(5px)" }}>
        <Figure className="size-full" />
      </div>
      <motion.div
        className="absolute left-[250px] top-[70px] h-[380px] w-[140px] opacity-40"
        style={{ backgroundImage: "repeating-linear-gradient(90deg, oklch(0.9 0 0 / 0.5) 0 1px, transparent 1px 11px)" }}
        animate={{ backgroundPositionY: ["0px", "380px"] }}
        transition={{ duration: 0.6, ease: "linear", repeat: Infinity }}
      />
      <div className="absolute left-[170px] top-[40px] h-[410px] w-[270px] bg-[oklch(0.9_0_0/0.08)] shadow-[inset_0_0_0_2px_oklch(1_0_0/0.12)] backdrop-blur-[3px]" />
    </>
  );
}

const reading: Pose = {
  ...restPose,
  turn: 1,
  frontLeg: { upper: 118, lower: -112 },
  backLeg: { upper: 110, lower: -104 },
  frontArm: { upper: 58, lower: 64 },
  backArm: { upper: 50, lower: 70 },
};

const couchSeat: Seat = { left: 262, top: 70, scale: 0.72 };
export const couchFace = faceOf(couchSeat);
const book = onScreen(couchSeat, handOf(reading));

export function Couch() {
  return (
    <>
      <div
        className="absolute left-[400px] top-[40px] size-[260px] rounded-full"
        style={{ background: "radial-gradient(closest-side, oklch(0.9 0.03 80 / 0.14), transparent)" }}
      />
      <div className="absolute left-[520px] top-[110px] h-[330px] w-2 bg-feed-raised" />
      <div className="absolute left-[492px] top-[96px] h-6 w-16 bg-feed-raised" />
      <div className="absolute left-[80px] top-[200px] h-[130px] w-[420px] rounded-t-[28px] bg-feed-raised" />
      <div className="absolute left-[60px] top-[300px] h-[70px] w-[460px] bg-line/70" />
      <div className="absolute left-[40px] top-[250px] h-[120px] w-[60px] rounded-t-[24px] bg-feed-raised" />
      <div className="absolute" style={rigBox(couchSeat)}>
        <PosedRig pose={reading} className="size-full overflow-visible" />
      </div>
      <div className="absolute h-[34px] w-[26px] -rotate-12 bg-ink-muted" style={{ left: book.x - 22, top: book.y - 26 }} />
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
