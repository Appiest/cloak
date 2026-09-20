import type { Beat } from "./script";

type Cue = { speaker: string; line: string };

export const cues: Record<Beat, Cue | undefined> = {
  title: undefined,
  alone: { speaker: "Alex", line: "Imagine a world where you are never completely alone." },
  watched: { speaker: "Matthew", line: "Something is always watching your actions," },
  unseen: { speaker: "Matthew", line: "and nothing you do or say goes unseen or unheard." },
  everywhere: { speaker: "Brendan", line: "Do you live in fear of being constantly surveilled?" },
  who: {
    speaker: "Brendan",
    line: "Who is watching you? And what are they doing with the footage and the intelligence gathered?",
  },
  reality: { speaker: "Christine", line: "We are already heading towards a world where this will be our reality." },
  whatNow: { speaker: "Ada", line: "So when it does happen, what are we going to do? (pause)" },
  perDay: { speaker: "Matthew", line: "The average person is caught on camera over 75 times a day." },
  foundCamera: {
    speaker: "Alex",
    line: "A recent survey of over a thousand people found that around half have discovered some kind of camera installed at a rental property.",
  },
  cantDetect: {
    speaker: "Alex",
    line: "And while many people worry about hidden cameras, 64% don’t know where to look.",
  },
  impersonate: {
    speaker: "Ada",
    line: "And that’s not even the scariest part. The audio and video footage collected can be manipulated by AI and used to impersonate,",
  },
  frame: { speaker: "Ada", line: "frame," },
  exploit: { speaker: "Ada", line: "and exploit you and the people closest to you." },
  watchers: {
    speaker: "Brendan",
    line: "We’ve already seen how legislation lags far behind the rocket ship of technological advancement.",
  },
  protections: {
    speaker: "Brendan",
    line: "To protect you and your loved ones, we need to design our own solution to evade machine intelligence.",
  },
  capOn: { speaker: "Christine", line: "That’s why we’ve created Cloak, a sleek, stylish baseball cap" },
  parts: { speaker: "Christine", line: "that combines infrared and ultrasonic transducer technology, making it impossible to record you." },
  irLight: {
    speaker: "Ada",
    line: "By projecting a strong beam of infrared light towards camera lenses,",
  },
  noFace: { speaker: "Ada", line: "Cloak turns you into a white blob." },
  ringOut: {
    speaker: "Matthew",
    line: "Using an array of small transducers to create a narrow, highly directed wave of audio, we can target nearby microphones",
  },
  jammed: {
    speaker: "Matthew",
    line: "and make any audio captured unusable, keeping your voice private.",
  },
  demo: { speaker: "Christine", line: "Let’s watch how Cloak protects our friend Alex in this video:" },
  video: { speaker: "Video", line: "The video plays with sound. Alex speaks when it ends." },
  takeHome: {
    speaker: "Alex",
    line: "That was awesome, but what’s even more awesome is that we built a real, functioning model.",
  },
  humanFirst: {
    speaker: "Christine",
    line: "Protecting humans from machine intelligence means putting human safety first.",
  },
  flock: {
    speaker: "Brendan",
    line: "With the rise of Flock, the rapid increase in national surveillance, and the advancement of frontier AI models, your safety is deeply intertwined with who has access to your image and your voice.",
  },
  together: {
    speaker: "Brendan",
    line: "So together, let’s Cloak ourselves, protecting the people dearest to us from machine surveillance.",
  },
  thanks: { speaker: "Ada", line: "Thank you." },
};
