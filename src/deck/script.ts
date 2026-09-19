export const slides = [
  { id: "never-alone", beats: ["alone", "watched", "everywhere"] },
  { id: "who-is-watching", beats: ["who", "reality", "whatNow"] },
] as const;

export type Beat = (typeof slides)[number]["beats"][number];

export const outline = slides.map((slide) => slide.beats.length);
