"use client";

import { BackdropWord } from "./scenes/BackdropWord";
import { Crowd } from "./scenes/Crowd";
import { FeedWall } from "./scenes/FeedWall";
import { FlowDiagram } from "./scenes/FlowDiagram";
import { Hero } from "./scenes/Hero";
import { MainFeedChrome, MainFeedFill } from "./scenes/MainFeed";
import { Question } from "./scenes/Question";
import type { Beat } from "./script";

export function Scene({ beat }: { beat: Beat }) {
  return (
    <>
      <BackdropWord beat={beat} />
      <Crowd beat={beat} />
      <MainFeedFill beat={beat} />
      <FeedWall beat={beat} />
      <FlowDiagram beat={beat} />
      <Hero beat={beat} />
      <MainFeedChrome beat={beat} />
      <Question beat={beat} />
    </>
  );
}
