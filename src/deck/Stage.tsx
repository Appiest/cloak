"use client";

import { useLayoutEffect, useState, type ReactNode } from "react";
import { canvas } from "./geometry";
import type { Look } from "./look";

const grain =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

function fitScale(): number {
  return Math.min(window.innerWidth / canvas.w, window.innerHeight / canvas.h);
}

type StageProps = { look: Look; children: ReactNode };

export function Stage({ look, children }: StageProps) {
  const [scale, setScale] = useState(0);

  useLayoutEffect(() => {
    const update = () => setScale(fitScale());
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <div data-look={look} className="fixed inset-0 flex items-center justify-center overflow-hidden bg-stage">
      <div
        className="relative shrink-0 overflow-hidden bg-stage"
        style={{
          width: canvas.w,
          height: canvas.h,
          transform: `scale(${scale})`,
          visibility: scale ? "visible" : "hidden",
        }}
      >
        {children}
        {look === "cctv" && <FeedTexture />}
      </div>
    </div>
  );
}

function FeedTexture() {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse at center, transparent 55%, oklch(0 0 0 / 0.55))" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "repeating-linear-gradient(to bottom, oklch(0 0 0 / 0.18) 0 1px, transparent 1px 4px)",
        }}
        aria-hidden
      />
      <div
        className="animate-grain pointer-events-none absolute -inset-[10%] opacity-[0.09] mix-blend-screen"
        style={{ backgroundImage: grain }}
        aria-hidden
      />
    </>
  );
}
