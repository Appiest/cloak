"use client";

import { MotionConfig } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { withLook, type Look } from "./look";
import { Scene } from "./Scene";
import { outline, slides } from "./script";
import { Stage } from "./Stage";
import { advance, last, retreat, start, toSearch, type Position } from "./timeline";
import { useDeckControls } from "./useDeckControls";

type DeckProps = { initial: Position; look: Look };

export function Deck({ initial, look }: DeckProps) {
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
    window.history.replaceState(null, "", `${window.location.pathname}${withLook(toSearch(position), look)}`);
  }, [position, look]);

  const beat = slides[position.slide].beats[position.beat];

  return (
    <MotionConfig reducedMotion="user">
      <main className="cursor-none select-none" onClick={commands.next}>
        <h1 className="sr-only">Cloak</h1>
        <p className="sr-only" aria-live="polite">
          {`Slide ${position.slide + 1} of ${slides.length}, beat ${position.beat + 1}`}
        </p>
        <Stage look={look}>
          <Scene beat={beat} />
        </Stage>
      </main>
    </MotionConfig>
  );
}
