"use client";

import { useClock } from "./useClock";

type OsdProps = { camera: string; recording?: boolean };

export function Osd({ camera, recording = true }: OsdProps) {
  const time = useClock();
  return (
    <div
      className="type-osd pointer-events-none absolute flex items-center justify-between text-ink-muted"
      style={{ left: "var(--osd-inset)", right: "var(--osd-inset)", top: "var(--osd-inset)" }}
    >
      <span className="flex items-center gap-3">
        {recording && (
          <span
            className="animate-rec size-3.5 rounded-full bg-mark"
            style={{ boxShadow: "0 0 18px 4px var(--color-mark-glow)" }}
          />
        )}
        {camera}
      </span>
      <span>{time}</span>
    </div>
  );
}
