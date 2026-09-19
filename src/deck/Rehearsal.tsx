import { cues } from "./cues";
import type { Beat } from "./script";
import type { Position } from "./timeline";

export function Rehearsal({ position, beat }: { position: Position; beat: Beat }) {
  const cue = cues[beat];
  return (
    <div className="pointer-events-none fixed bottom-4 left-44 right-20 z-50 flex items-end justify-between gap-6" aria-hidden>
      <p className="type-osd shrink-0 bg-redacted/80 px-2 py-1.5 text-sm text-ink-muted">
        {`Slide ${position.slide + 1} · Beat ${position.beat + 1}`}
      </p>
      <p className="max-w-xl bg-redacted/80 px-3 py-2 text-base text-ink" style={{ textWrap: "pretty" }}>
        {cue ? (
          <>
            <span className="font-semibold text-mark">{cue.speaker}</span> {cue.line}
          </>
        ) : (
          <span className="text-ink-muted">No line yet. Alex opens on the next beat.</span>
        )}
      </p>
    </div>
  );
}
