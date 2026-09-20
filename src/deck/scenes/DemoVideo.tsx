"use client";

import { motion } from "motion/react";
import { useEffect, useRef } from "react";
import { sceneEase } from "../motion";
import type { Beat } from "../script";

const fadeToBlackSeconds = 0.8;
// Leaving the video, the black backing holds while the scene underneath
// finishes changing. Without the hold you catch the previous slide mid-move
// through the gap.
const holdBlackSeconds = 0.55;

export function DemoVideo({ beat }: { beat: Beat }) {
  const playing = beat === "video";
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const element = video.current;
    if (!element) return;
    if (!playing) {
      element.pause();
      return;
    }
    element.currentTime = 0;
    const start = window.setTimeout(() => void element.play(), fadeToBlackSeconds * 1000);
    return () => window.clearTimeout(start);
  }, [playing]);

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 bg-redacted"
      style={{ x: 0, y: 0, width: "100%", height: "100%" }}
      initial={false}
      animate={{ opacity: playing ? 1 : 0 }}
      transition={{
        duration: fadeToBlackSeconds,
        ease: sceneEase,
        delay: playing ? 0 : holdBlackSeconds,
      }}
    >
      <motion.video
        ref={video}
        src="/video/cloak-demo.mp4"
        preload="auto"
        playsInline
        className="size-full object-cover"
        initial={false}
        animate={{ opacity: playing ? 1 : 0 }}
        transition={{ duration: 0.3, delay: playing ? fadeToBlackSeconds : 0 }}
      />
    </motion.div>
  );
}
