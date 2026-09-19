"use client";

import { BackdropWord } from "./scenes/BackdropWord";
import { Counted } from "./scenes/Counted";
import { Crowd } from "./scenes/Crowd";
import { FeedWall } from "./scenes/FeedWall";
import { FlowDiagram } from "./scenes/FlowDiagram";
import { Hero } from "./scenes/Hero";
import { Infrared, InfraredLight } from "./scenes/Infrared";
import { Manipulated, SplitBar } from "./scenes/Manipulated";
import { Timeline } from "./scenes/Timeline";
import { MainFeedChrome, MainFeedFill } from "./scenes/MainFeed";
import { Question } from "./scenes/Question";
import { Reveal } from "./scenes/Reveal";
import { Title } from "./scenes/Title";
import type { Beat } from "./script";

export function Scene({ beat }: { beat: Beat }) {
  return (
    <>
      <BackdropWord beat={beat} />
      <Crowd beat={beat} />
      <MainFeedFill beat={beat} />
      <FeedWall beat={beat} />
      <FlowDiagram beat={beat} />
      <Counted beat={beat} />
      <SplitBar beat={beat} />
      <Timeline beat={beat} />
      <Manipulated beat={beat} />
      <Infrared beat={beat} />
      <Hero beat={beat} />
      <InfraredLight beat={beat} />
      <MainFeedChrome beat={beat} />
      <Question beat={beat} />
      <Reveal beat={beat} />
      <Title beat={beat} />
    </>
  );
}
