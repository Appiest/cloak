"use client";

import { MotionConfig } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { Scene } from "./Scene";
import { DemoVideo } from "./scenes/DemoVideo";
import { outline, slides } from "./script";
import { Rehearsal } from "./Rehearsal";
import { Stage } from "./Stage";
import { advance, last, retreat, start, toSearch, type Position } from "./timeline";
import { useDeckControls } from "./useDeckControls";

export function Deck({ initial }: { initial: Position }) {
  const [position, setPosition] = useState(initial);

  const commands = useMemo(
    () => ({
      next: () => setPosition((current) => advance(current, outline)),
      previous: () => setPosition((current) => retreat(current, outline)),
      first: () => setPosition(start),
      last: () => setPosition(last(outline)),
    }),
    [],
  );
  useDeckControls(commands);

  useEffect(() => {
    window.history.replaceState(null, "", `${window.location.pathname}${toSearch(position)}`);
  }, [position]);

  const beat = slides[position.slide].beats[position.beat];

  return (
    <MotionConfig reducedMotion="user">
      <main className="cursor-none select-none" onClick={commands.next}>
        <h1 className="sr-only">Cloak</h1>
        <p className="sr-only" aria-live="polite">
          {`Slide ${position.slide + 1} of ${slides.length}, beat ${position.beat + 1}`}
        </p>
        <Stage foreground={<DemoVideo beat={beat} />}>
          <Scene beat={beat} />
        </Stage>
        <Rehearsal position={position} beat={beat} />
      </main>
    </MotionConfig>
  );
}
