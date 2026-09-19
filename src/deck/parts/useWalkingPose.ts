"use client";

import { useSpring, useTransform, useVelocity, type MotionValue } from "motion/react";
import { useEffect } from "react";
import { figureSize } from "../geometry";
import { stridePerCycle, walkingPose } from "./skeleton";

const streetScale = 560 / figureSize.h;
const strideInPixels = stridePerCycle * (figureSize.w / 200) * streetScale;
const cruisingSpeed = 40;

export function useWalkingPose(x: MotionValue<number>, walking: boolean) {
  const velocity = useVelocity(x);
  const walkingNow = useSpring(0, { stiffness: 120, damping: 20 });

  useEffect(() => {
    walkingNow.set(walking ? 1 : 0);
  }, [walking, walkingNow]);

  const stepping = useSpring(
    useTransform(velocity, (speed) => Math.min(1, Math.abs(speed) / cruisingSpeed)),
    { stiffness: 90, damping: 18 },
  );

  return useTransform([x, stepping, walkingNow], ([left, moving, enabled]: number[]) => {
    const amount = moving * enabled;
    const phase = (-left / strideInPixels) * Math.PI * 2;
    return walkingPose(phase, amount, enabled);
  });
}
