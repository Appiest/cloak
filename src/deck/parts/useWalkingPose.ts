"use client";

import { useSpring, useTransform, useVelocity, type MotionValue } from "motion/react";
import { useEffect } from "react";
import { figureSize } from "../geometry";
import { stridePerCycle, walkingPose } from "./skeleton";

const cruisingSpeed = 40;

export function useWalkingPose(travel: MotionValue<number>, walking: boolean, scale: number) {
  const strideInPixels = stridePerCycle * (figureSize.w / 200) * scale;
  const velocity = useVelocity(travel);
  const walkingNow = useSpring(0, { stiffness: 120, damping: 20 });

  useEffect(() => {
    walkingNow.set(walking ? 1 : 0);
  }, [walking, walkingNow]);

  const stepping = useSpring(
    useTransform(velocity, (speed) => Math.min(1, Math.abs(speed) / cruisingSpeed)),
    { stiffness: 90, damping: 18 },
  );

  return useTransform([travel, stepping, walkingNow], ([travelled, moving, enabled]: number[]) => {
    const phase = (travelled / strideInPixels) * Math.PI * 2;
    return walkingPose(phase, moving * enabled, enabled);
  });
}
