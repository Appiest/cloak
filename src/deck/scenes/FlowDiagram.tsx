"use client";

import { motion } from "motion/react";
import { thumbStackMiddle, thumbStackRight } from "../geometry";
import { sceneEase, sceneMove } from "../motion";
import type { Beat } from "../script";

type Destination = { question: string; y: number; bars: number[] };

const destinations: Destination[] = [
  { question: "Who’s watching?", y: 250, bars: [0.72, 0.5, 0.86] },
  { question: "What happens to the footage?", y: 650, bars: [0.6, 0.9, 0.44] },
];

const nodeX = 1080;
const nodeW = 700;
const nodeH = 190;
const origin = { x: thumbStackRight + 28, y: thumbStackMiddle };

function route(targetY: number) {
  const midX = (origin.x + nodeX) / 2;
  return `M${origin.x} ${origin.y} C${midX} ${origin.y} ${midX} ${targetY} ${nodeX} ${targetY}`;
}

export function FlowDiagram({ beat }: { beat: Beat }) {
  const visible = beat === "who";
  return (
    <motion.div
      className="absolute inset-0"
      initial={false}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: visible ? 0.3 : 0.6, ease: sceneEase }}
    >
      <svg className="absolute inset-0 size-full" viewBox="0 0 1920 1080" aria-hidden>
        {destinations.map((destination, index) => {
          const path = route(destination.y + nodeH / 2);
          return (
            <g key={destination.question}>
              <motion.path
                d={path}
                fill="none"
                stroke="var(--color-line)"
                strokeWidth={3}
                initial={false}
                animate={{ pathLength: visible ? 1 : 0 }}
                transition={{ ...sceneMove, delay: visible ? 0.7 + index * 0.25 : 0 }}
              />
              {visible && <Pulses path={path} offset={index * 0.6} />}
            </g>
          );
        })}
      </svg>
      {destinations.map((destination, index) => (
        <motion.div
          key={destination.question}
          className="absolute flex flex-col justify-between rounded-tile border border-node-edge bg-feed p-8 shadow-tile"
          style={{ left: nodeX, top: destination.y, width: nodeW, height: nodeH }}
          initial={false}
          animate={{ opacity: visible ? 1 : 0, x: visible ? 0 : 40 }}
          transition={{ ...sceneMove, delay: visible ? 1.3 + index * 0.25 : 0 }}
        >
          <p className="type-label text-ink">{destination.question}</p>
          <div className="flex gap-3">
            {destination.bars.map((width, bar) => (
              <motion.span
                key={bar}
                className="h-7 origin-left bg-redacted"
                style={{ width: `${width * 30}%` }}
                initial={false}
                animate={{ scaleX: visible ? 1 : 0 }}
                transition={{ ...sceneMove, delay: visible ? 1.7 + bar * 0.15 : 0 }}
              />
            ))}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

function Pulses({ path, offset }: { path: string; offset: number }) {
  return (
    <>
      {[0, 1, 2].map((pulse) => (
        <motion.rect
          key={pulse}
          width={22}
          height={16}
          x={-11}
          y={-8}
          fill="var(--color-figure)"
          style={{ offsetPath: `path("${path}")`, offsetRotate: "0deg" }}
          initial={{ offsetDistance: "0%", opacity: 0 }}
          animate={{ offsetDistance: "100%", opacity: [0, 1, 1, 0] }}
          transition={{
            duration: 2.4,
            ease: "linear",
            repeat: Infinity,
            delay: 2 + offset + pulse * 0.8,
          }}
        />
      ))}
    </>
  );
}
