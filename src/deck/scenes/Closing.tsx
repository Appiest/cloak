"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { sceneEase, sceneMove } from "../motion";
import { isAtOrAfter, type Beat } from "../script";

const photo = { x: 430, y: 110, w: 1060, h: 707 };

// The one bright frame in the deck. After eleven slides of surveillance dark,
// the real object arrives lit and clean, and the illustration steps aside so
// nothing competes with it.
// Rendered through Stage's foreground slot so the scanline and grain layers do
// not sit on it. Everything else in the deck is a feed; this is the object.
export function PrototypePhoto({ beat }: { beat: Beat }) {
  const visible = beat === "takeHome";
  return (
    <motion.div
      className="pointer-events-none absolute overflow-hidden"
      style={{
        left: photo.x,
        top: photo.y,
        width: photo.w,
        height: photo.h,
        boxShadow: "0 40px 90px oklch(0 0 0 / 0.75), 0 0 0 1px oklch(1 0 0 / 0.08)",
      }}
      initial={false}
      animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.94, y: visible ? 0 : 24 }}
      transition={{ ...sceneMove, delay: visible ? 0.25 : 0 }}
    >
      <Image
        src="/photos/prototype-front.jpg"
        alt="The Cloak prototype: a black baseball cap with an ultrasonic transducer module mounted on the front panel"
        width={1536}
        height={1024}
        priority
        className="size-full object-cover"
      />
    </motion.div>
  );
}

export function TakeHome({ beat }: { beat: Beat }) {
  const visible = beat === "takeHome";
  return (
    <div className="pointer-events-none absolute inset-0">
      <motion.h2
        className="type-display absolute inset-x-0 top-[880px] text-center text-[120px] text-ink"
        initial={false}
        animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 24 }}
        transition={{ ...sceneMove, delay: visible ? 0.7 : 0 }}
      >
        We built a working prototype
      </motion.h2>
    </div>
  );
}

export function Closing({ beat }: { beat: Beat }) {
  const wordmarkUp = isAtOrAfter(beat, "together");
  return (
    <div className="pointer-events-none absolute inset-0">
      <Blackout firing={beat === "together"} />
      <motion.h2
        className="type-display absolute inset-x-0 top-[70px] text-center text-[260px] text-ink"
        initial={false}
        animate={{ opacity: wordmarkUp ? 1 : 0, y: wordmarkUp ? 0 : -30 }}
        transition={{ duration: 1.2, ease: sceneEase, delay: beat === "together" ? 3.4 : 0 }}
      >
        Cloak
      </motion.h2>
    </div>
  );
}



// The caps blinding every lens at once. A background gradient rather than a
// filter, so it never hits the rasteriser's ceiling when it scales up.
function Blackout({ firing }: { firing: boolean }) {
  return (
    <motion.div
      className="pointer-events-none absolute left-1/2 top-[780px] size-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full mix-blend-screen"
      style={{ background: "radial-gradient(closest-side, oklch(1 0 0 / 0.95), oklch(1 0 0 / 0.35) 55%, transparent)" }}
      initial={false}
      animate={firing ? { opacity: [0, 1, 0], scale: [0.3, 3.2, 4] } : { opacity: 0, scale: 0.3 }}
      transition={firing ? { duration: 1.7, times: [0, 0.38, 1], ease: sceneEase, delay: 1.8 } : { duration: 0.3 }}
      aria-hidden
    />
  );
}
