import type { Transition } from "motion/react";
import type { Beat } from "./script";

export const sceneEase = [0.2, 0, 0, 1] as const;

// Longer than feels necessary when you step through slowly, because a
// presenter clicks ahead of the move as often as not. A move that is still
// travelling when the next beat lands retargets from where it is; one that has
// just snapped to its end has nowhere to go but jump.
export const sceneMove: Transition = { duration: 1.5, ease: sceneEase };

export const pullBack: Transition = { duration: 5.5, ease: [0.45, 0, 0.25, 1] };

export function moveFor(beat: Beat): Transition {
  return beat === "who" ? pullBack : sceneMove;
}

export const quickFade: Transition = { duration: 0.7, ease: sceneEase };

export function pick<T>(states: Partial<Record<Beat, T>>, beat: Beat, fallback: T): T {
  return states[beat] ?? fallback;
}
