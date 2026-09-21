export const slides = [
  { id: "title", beats: ["title"] },
  { id: "never-alone", beats: ["alone", "watched", "unseen", "everywhere"] },
  { id: "who-is-watching", beats: ["who", "reality", "whatNow"] },
  { id: "counted", beats: ["perDay", "foundCamera", "cantDetect"] },
  { id: "manipulated", beats: ["impersonate", "frame", "exploit"] },
  { id: "law-lags", beats: ["watchers", "protections"] },
  { id: "reveal", beats: ["capOn", "parts"] },
  { id: "infrared", beats: ["irLight", "noFace"] },
  { id: "ultrasonic", beats: ["ringOut", "jammed"] },
  { id: "demo", beats: ["demo", "video"] },
  { id: "take-home", beats: ["takeHome"] },
  { id: "human-first", beats: ["humanFirst"] },
  { id: "intertwined", beats: ["flockNetwork", "nationwide", "frontierModels"] },
  { id: "closing", beats: ["together", "thanks"] },
] as const;

export type Beat = (typeof slides)[number]["beats"][number];

export const outline = slides.map((slide) => slide.beats.length);

const beatOrder: readonly Beat[] = slides.flatMap((slide) => slide.beats);

export function isAtOrAfter(beat: Beat, milestone: Beat): boolean {
  return beatOrder.indexOf(beat) >= beatOrder.indexOf(milestone);
}
