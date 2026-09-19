import { useId } from "react";

const silhouette =
  "M86 96C86 104 80 110 66 114C46 120 40 132 38 150L30 290C30 300 44 302 46 292L54 172L58 282L62 500C62 510 94 510 94 500L98 318L102 318L106 500C106 510 138 510 138 500L142 282L146 172L154 292C156 302 170 300 170 290L162 150C160 132 154 120 134 114C120 110 114 104 114 96Z";

type FigureProps = { mirrored?: boolean; synthetic?: boolean; className?: string };

const syntheticOutline = {
  fill: "none",
  stroke: "var(--color-mark)",
  strokeWidth: 3,
  strokeDasharray: "8 7",
  vectorEffect: "non-scaling-stroke",
} as const;

export function Figure({ mirrored = false, synthetic = false, className }: FigureProps) {
  const lightId = useId();
  const paint = synthetic ? syntheticOutline : { fill: `url(#${lightId})` };
  return (
    <svg
      viewBox="0 0 200 520"
      className={className}
      style={mirrored ? { transform: "scaleX(-1)" } : undefined}
      aria-hidden
    >
      <defs>
        <linearGradient id={lightId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--color-figure)" />
          <stop offset="1" stopColor="var(--color-figure-shade)" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="58" r="32" {...paint} />
      <path d={silhouette} {...paint} />
    </svg>
  );
}
