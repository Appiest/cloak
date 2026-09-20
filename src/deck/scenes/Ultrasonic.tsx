"use client";

import { Microphone } from "@phosphor-icons/react";
import { motion } from "motion/react";
import { useId } from "react";
import { headAt, pointOnFigure, sideFeed, type Placement } from "../geometry";
import { quickFade, sceneEase, sceneMove } from "../motion";
import { Noise } from "../parts/Noise";
import { Osd } from "../parts/Osd";
import { SourceStack, type SourceBlock } from "../parts/SourceStack";
import { Waveform } from "../parts/Waveform";
import type { Beat } from "../script";
import { sources } from "../sources";

export const ultrasonicHero = {
  ringOut: headAt(1330, 560, 4.2),
  jammed: headAt(330, 880, 2.4),
} satisfies Partial<Record<Beat, Placement>>;

const beatSources: Partial<Record<Beat, SourceBlock>> = {
  ringOut: { list: [sources.wearableJammer], left: 100, width: 680 },
  jammed: { list: [sources.wearableJammer], left: sideFeed.x, width: sideFeed.w },
};

const microphones = [
  { name: "MIC 02", x: 820, y: 800 },
  { name: "MIC 03", x: 1640, y: 250 },
  { name: "MIC 04", x: 1600, y: 880 },
];

export function Ultrasonic({ beat }: { beat: Beat }) {
  const radiating = beat === "ringOut";
  const jamming = beat === "jammed";
  return (
    <div className="pointer-events-none absolute inset-0">
      {microphones.map((microphone, index) => (
        <MicrophoneMark key={microphone.name} {...microphone} visible={radiating} order={index} />
      ))}
      <MicrophoneFeed visible={jamming} />
      <SourceStack beat={beat} blocks={beatSources} />
    </div>
  );
}

const ringCount = 4;
const ringCycle = 3.2;
const ringReach = 3.6;

function bandEllipse() {
  const center = pointOnFigure(ultrasonicHero.ringOut, 100, 50);
  const edge = pointOnFigure(ultrasonicHero.ringOut, 134, 50);
  const rx = edge.x - center.x;
  return { cx: center.x, cy: center.y, rx, ry: rx * 0.26 };
}

type Half = "back" | "front";

export function SoundRings({ beat, half }: { beat: Beat; half: Half }) {
  const visible = beat === "ringOut";
  const clipId = useId();
  const band = bandEllipse();
  const clipY = half === "back" ? 0 : band.cy;
  const clipHeight = half === "back" ? band.cy : 1080 - band.cy;
  return (
    <svg className="absolute inset-0 size-full" viewBox="0 0 1920 1080" aria-hidden>
      <clipPath id={clipId}>
        <rect x={0} y={clipY} width={1920} height={clipHeight} />
      </clipPath>
      <g clipPath={`url(#${clipId})`}>
        {visible &&
          Array.from({ length: ringCount }, (_, index) => (
            <motion.ellipse
              key={index}
              cx={band.cx}
              cy={band.cy}
              fill="none"
              stroke="var(--color-mark)"
              strokeWidth={3}
              initial={{ rx: band.rx, ry: band.ry, opacity: 0 }}
              animate={{ rx: band.rx * ringReach, ry: band.ry * ringReach, opacity: [0, 0.9, 0] }}
              transition={{
                duration: ringCycle,
                ease: "easeOut",
                repeat: Infinity,
                delay: 0.8 + (index * ringCycle) / ringCount,
              }}
            />
          ))}
      </g>
    </svg>
  );
}

type MicrophoneMarkProps = { name: string; x: number; y: number; visible: boolean; order: number };

function MicrophoneMark({ name, x, y, visible, order }: MicrophoneMarkProps) {
  const delay = visible ? 0.9 + order * 0.2 : 0;
  return (
    <motion.div
      className="absolute flex items-center gap-4 text-ink-muted"
      style={{ left: x, top: y }}
      initial={false}
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 12 }}
      transition={{ ...quickFade, delay }}
    >
      <Microphone size={56} weight="regular" />
      <div>
        <p className="type-osd">{name}</p>
        <motion.div
          className="mt-3 h-8 w-32"
          initial={false}
          animate={{ opacity: visible ? 1 : 0 }}
          transition={{ ...quickFade, delay: visible ? delay + 1.4 : 0 }}
        >
          {visible && <Noise count={16} className="size-full" />}
        </motion.div>
      </div>
    </motion.div>
  );
}

const transcript = [
  { word: "I’ll", heard: false },
  { word: "send", heard: false },
  { word: "the", heard: true },
  { word: "account", heard: false },
  { word: "number", heard: false },
  { word: "after", heard: false },
  { word: "lunch", heard: false },
  { word: "today", heard: false },
];

function MicrophoneFeed({ visible }: { visible: boolean }) {
  return (
    <motion.div
      className="absolute overflow-hidden bg-feed"
      style={{ left: sideFeed.x, top: sideFeed.y, width: sideFeed.w, height: sideFeed.h }}
      initial={false}
      animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.96 }}
      transition={{ ...sceneMove, delay: visible ? 0.3 : 0 }}
    >
      <div className="absolute inset-x-0 top-[70px] h-[340px]">
        <Waveform />
        <motion.div
          className="absolute inset-x-12 top-1/2 h-64 -translate-y-1/2 mix-blend-screen"
          initial={false}
          animate={{ opacity: visible ? 1 : 0 }}
          transition={{ duration: 0.6, ease: sceneEase, delay: visible ? 1.2 : 0 }}
        >
          {visible && <Noise count={120} className="size-full" />}
        </motion.div>
      </div>
      <p className="type-label absolute inset-x-12 bottom-20 flex flex-wrap items-center gap-x-5 gap-y-3 text-ink">
        {transcript.map((entry, index) => (
          <TranscriptWord key={entry.word} {...entry} visible={visible} order={index} />
        ))}
      </p>
      <div className="absolute inset-0 shadow-[inset_0_0_0_1px_oklch(1_0_0/0.1)]" />
      <Osd camera="MIC 01" />
    </motion.div>
  );
}

type TranscriptWordProps = { word: string; heard: boolean; visible: boolean; order: number };

function TranscriptWord({ word, heard, visible, order }: TranscriptWordProps) {
  const redacted = visible && !heard;
  return (
    <span className="relative">
      <span className={heard ? "text-ink" : "text-ink-muted"}>{word}</span>
      <motion.span
        className="absolute -inset-x-1 -inset-y-1 origin-left bg-ink-faint"
        initial={false}
        animate={{ scaleX: redacted ? 1 : 0 }}
        transition={{ duration: 0.3, ease: sceneEase, delay: redacted ? 1.4 + order * 0.08 : 0 }}
        aria-hidden
      />
    </span>
  );
}
