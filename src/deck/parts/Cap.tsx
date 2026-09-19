import { useId } from "react";

export const capLeds = [
  { x: 81, y: 63.5 },
  { x: 90.5, y: 65.8 },
  { x: 100, y: 66.6 },
  { x: 109.5, y: 65.8 },
  { x: 119, y: 63.5 },
];

const transducerXs = Array.from({ length: 8 }, (_, index) => 73 + index * 7.7);

export const capAnchors = {
  led: capLeds[0],
  transducer: { x: transducerXs[7], y: 48.5 },
};

type CapProps = { className?: string; glowing?: boolean; ledColor?: string; cropped?: boolean };

export function Cap({ className, glowing = false, ledColor = "var(--color-mark)", cropped = false }: CapProps) {
  const shadeId = useId();
  return (
    <svg viewBox={cropped ? "58 14 84 58" : "0 0 200 520"} className={className} aria-hidden>
      <defs>
        <linearGradient id={shadeId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--color-cap)" />
          <stop offset="1" stopColor="var(--color-cap-shade)" />
        </linearGradient>
      </defs>
      <path d="M67 54C67 31 80 20 100 20C120 20 133 31 133 54Z" fill={`url(#${shadeId})`} />
      <path d="M100 21V53M84 24C80 34 79 44 80 53M116 24C120 34 121 44 120 53" stroke="var(--color-cap-shade)" strokeWidth="1" fill="none" />
      <circle cx="100" cy="20.5" r="2.6" fill="var(--color-cap-shade)" />
      {transducerXs.map((x) => (
        <circle key={x} cx={x} cy="48.5" r="1.7" fill="var(--color-line)" />
      ))}
      <path d="M62 54C76 50.5 124 50.5 138 54C132 63 117 69 100 69C83 69 68 63 62 54Z" fill="var(--color-cap-shade)" />
      {capLeds.map((led) => (
        <circle
          key={led.x}
          cx={led.x}
          cy={led.y}
          r="1.9"
          fill={ledColor}
          style={glowing ? { filter: `drop-shadow(0 0 3px ${ledColor})` } : undefined}
        />
      ))}
    </svg>
  );
}
