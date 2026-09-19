"use client";

import { motion } from "motion/react";

const bars = Array.from({ length: 36 }, (_, index) => {
  const envelope = Math.sin((index / 35) * Math.PI);
  const texture = 0.45 + 0.55 * Math.abs(Math.sin(index * 2.3));
  return Math.max(0.08, envelope * texture);
});

export function Waveform({ barClassName = "bg-figure" }: { barClassName?: string }) {
  return (
    <div className="absolute inset-x-12 top-1/2 flex h-48 -translate-y-1/2 items-center justify-between">
      {bars.map((height, index) => (
        <motion.span
          key={index}
          className={`w-2.5 rounded-full ${barClassName}`}
          style={{ height: `${height * 100}%` }}
          animate={{ scaleY: [1, 0.35, 0.8, 0.5, 1] }}
          transition={{
            duration: 1.6,
            repeat: Infinity,
            delay: (index % 7) * 0.09,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
