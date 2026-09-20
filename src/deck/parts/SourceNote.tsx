import type { Source } from "../sources";

export function SourceNote({ source }: { source: Source }) {
  return <p className="type-source max-w-[860px] text-ink-muted">Source: {source.citation}</p>;
}
