"use client";

import { motion } from "motion/react";
import { figureSize, heroInside, pointOnFigure, wallTiles, type Rect } from "../geometry";
import { quickFade, sceneEase } from "../motion";
import { FaceCount } from "../parts/FaceCount";
import { Noise } from "../parts/Noise";
import type { Beat } from "../script";
import { views, type Glare } from "./FeedWall";

const firstWhiteout = 1.6;
const whiteoutStep = 0.5;
const maxGlare = 320;

function heroGlare(): Glare {
  const hero = heroInside(wallTiles[0]);
  const face = pointOnFigure(hero, 100, 66);
  const unit = (figureSize.w / 200) * hero.scale;
  return { x: face.x - wallTiles[0].x, y: face.y - wallTiles[0].y, r: 30 * unit };
}

const cameraTiles = [
  { tile: wallTiles[0], face: heroGlare() },
  ...views.flatMap((view, index) => (view.face ? [{ tile: wallTiles[index + 1], face: view.face }] : [])),
];

const microphoneTile = wallTiles[1 + views.findIndex((view) => !view.face)];

export function Demo({ beat }: { beat: Beat }) {
  const playing = beat === "demo";
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {cameraTiles.map(({ tile, face }, order) => (
        <Whiteout key={`${tile.x}-${tile.y}`} tile={tile} face={face} playing={playing} delay={firstWhiteout + order * whiteoutStep} />
      ))}
      <JammedMicrophone tile={microphoneTile} playing={playing} delay={firstWhiteout + cameraTiles.length * whiteoutStep} />
    </div>
  );
}

type WhiteoutProps = { tile: Rect; face: Glare; playing: boolean; delay: number };

function Whiteout({ tile, face, playing, delay }: WhiteoutProps) {
  const size = Math.min(face.r * 5, maxGlare);
  return (
    <motion.div
      className="absolute overflow-hidden"
      style={{ left: tile.x, top: tile.y, width: tile.w, height: tile.h }}
      initial={false}
      animate={{ opacity: playing ? 1 : 0 }}
      transition={playing ? { duration: 0.35, ease: sceneEase, delay } : quickFade}
    >
      <motion.div
        className="absolute inset-0 bg-ink mix-blend-screen"
        initial={false}
        animate={{ opacity: playing ? [0, 0.6, 0.08] : 0 }}
        transition={{ duration: 0.9, ease: sceneEase, delay: playing ? delay : 0 }}
      />
      <div
        className="absolute rounded-full mix-blend-screen"
        style={{
          left: face.x - size / 2,
          top: face.y - size / 2,
          width: size,
          height: size,
          background: "radial-gradient(closest-side, oklch(1 0 0) 30%, oklch(1 0 0 / 0.45) 60%, transparent)",
        }}
      />
      <FaceCount />
    </motion.div>
  );
}

type JammedMicrophoneProps = { tile: Rect; playing: boolean; delay: number };

function JammedMicrophone({ tile, playing, delay }: JammedMicrophoneProps) {
  return (
    <motion.div
      className="absolute mix-blend-screen"
      style={{ left: tile.x + 48, top: tile.y + 116, width: tile.w - 96, height: 232 }}
      initial={false}
      animate={{ opacity: playing ? 1 : 0 }}
      transition={playing ? { duration: 0.6, ease: sceneEase, delay } : quickFade}
    >
      {playing && <Noise count={90} className="size-full" />}
    </motion.div>
  );
}
