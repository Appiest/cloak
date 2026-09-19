"use client";


import { BackdropWord } from "./scenes/BackdropWord";
import { Closing, TakeHome } from "./scenes/Closing";
import { Counted } from "./scenes/Counted";
import { Demo } from "./scenes/Demo";
import { Crowd } from "./scenes/Crowd";
import { FeedWall } from "./scenes/FeedWall";
import { Hero } from "./scenes/Hero";
import { Infrared, InfraredLight } from "./scenes/Infrared";
import { Manipulated, SplitBar } from "./scenes/Manipulated";
import { Timeline } from "./scenes/Timeline";
import { MainFeedChrome, MainFeedFill } from "./scenes/MainFeed";
import { Question } from "./scenes/Question";
import { Reveal } from "./scenes/Reveal";
import { Title } from "./scenes/Title";
import { WatchRoom, WatchRoomForeground } from "./scenes/WatchRoom";
import { useStreetTravel, WalkHome } from "./scenes/WalkHome";
import { SoundRings, Ultrasonic } from "./scenes/Ultrasonic";
import type { Beat } from "./script";

export function Scene({ beat }: { beat: Beat }) {
  const travel = useStreetTravel(beat);
  return (
    <>
      <BackdropWord beat={beat} />
      <WalkHome beat={beat} travel={travel} />
      <Crowd beat={beat} />
      <WatchRoom beat={beat} />
      <MainFeedFill beat={beat} />
      <FeedWall beat={beat} />
      <Counted beat={beat} />
      <SplitBar beat={beat} />
      <Timeline beat={beat} />
      <Manipulated beat={beat} />
      <Infrared beat={beat} />
      <Ultrasonic beat={beat} />
      <SoundRings beat={beat} half="back" />
      <Hero beat={beat} travel={travel} />
      <InfraredLight beat={beat} />
      <SoundRings beat={beat} half="front" />
      <MainFeedChrome beat={beat} />
      <WatchRoomForeground beat={beat} />
      <Demo beat={beat} />
      <TakeHome beat={beat} />
      <Closing beat={beat} />
      <Question beat={beat} />
      <Reveal beat={beat} />
      <Title beat={beat} />
    </>
  );
}
