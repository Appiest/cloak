"use client";

import { motion } from "motion/react";

function jitter(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

type NoiseProps = { count?: number; className?: string; barClassName?: string };

export function Noise({ count = 72, className = "", barClassName = "bg-mark" }: NoiseProps) {
  return (
    <div className={`flex items-center justify-between ${className}`} aria-hidden>
      {Array.from({ length: count }, (_, index) => (
        <motion.span
          key={index}
          className={`w-1 ${barClassName}`}
          style={{ height: "100%" }}
          animate={{ scaleY: [jitter(index), jitter(index + 97), jitter(index + 211), jitter(index)] }}
          transition={{ duration: 0.45, repeat: Infinity, ease: "linear", delay: jitter(index + 5) * 0.3 }}
        />
      ))}
    </div>
  );
}
