export const slides = [
  { id: "title", beats: ["title"] },
  { id: "never-alone", beats: ["alone", "watched", "everywhere"] },
  { id: "who-is-watching", beats: ["who", "reality", "whatNow"] },
  { id: "counted", beats: ["perDay", "foundCamera", "cantDetect"] },
  { id: "manipulated", beats: ["cloned", "undetected"] },
  { id: "law-lags", beats: ["watchers", "protections"] },
] as const;

export type Beat = (typeof slides)[number]["beats"][number];

export const outline = slides.map((slide) => slide.beats.length);
