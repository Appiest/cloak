"use client";

import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { useEffect } from "react";
import { sceneEase } from "../motion";

type CountUpProps = { value: number; suffix?: string; duration?: number };

export function CountUp({ value, suffix = "", duration = 1.8 }: CountUpProps) {
  const count = useMotionValue(0);
  const text = useTransform(count, (current) => `${Math.round(current)}${suffix}`);

  useEffect(() => {
    const controls = animate(count, value, { duration, ease: sceneEase });
    return () => controls.stop();
  }, [count, value, duration]);

  return <motion.span className="tabular-nums">{text}</motion.span>;
}
