// Drives the running deck over CDP and captures frames while a beat change animates.
// Static screenshots cannot show this: deep-linking mounts a beat already settled,
// so a transition only plays when the beat actually changes in a live page.
//
//   node scripts/capture-beat.mjs --from 3.1 --frames 0,300,600,900,1400 --out /tmp/shots
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { setTimeout as wait } from "node:timers/promises";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9333;

function arg(name, fallback) {
  const at = process.argv.indexOf(`--${name}`);
  return at === -1 ? fallback : process.argv[at + 1];
}

const [slide, beat] = arg("from", "3.1").split(".");
const frames = arg("frames", "0,300,600,900,1400").split(",").map(Number);
const outDir = arg("out", "/tmp/deck-frames");
const label = arg("label", `beat${slide}_${beat}`);
const url = `http://localhost:3001/present?slide=${slide}&beat=${beat}`;

mkdirSync(outDir, { recursive: true });

async function cdpTargets() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${PORT}/json`);
      const targets = await response.json();
      const page = targets.find((t) => t.type === "page" && t.webSocketDebuggerUrl);
      if (page) return page;
    } catch {
      // Chrome is still coming up.
    }
    await wait(250);
  }
  throw new Error("Chrome never exposed a debuggable page");
}

function connect(wsUrl) {
  const socket = new WebSocket(wsUrl);
  const pending = new Map();
  let nextId = 0;
  const ready = new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    const settle = pending.get(message.id);
    if (!settle) return;
    pending.delete(message.id);
    if (message.error) settle.reject(new Error(message.error.message));
    else settle.resolve(message.result);
  });
  const send = (method, params = {}) => {
    const id = (nextId += 1);
    socket.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
  };
  return { ready, send, close: () => socket.close() };
}

const chrome = spawn(CHROME, [
  `--remote-debugging-port=${PORT}`,
  "--headless=new",
  "--disable-gpu",
  "--no-first-run",
  "--window-size=1280,720",
  "--user-data-dir=" + `${outDir}/profile`,
  url,
], { stdio: "ignore" });

try {
  const target = await cdpTargets();
  const cdp = connect(target.webSocketDebuggerUrl);
  await cdp.ready;
  await cdp.send("Page.enable");
  await wait(2500); // let fonts, the scene and the first beat settle

  const shoot = async (name) => {
    const { data } = await cdp.send("Page.captureScreenshot", { format: "png" });
    writeFileSync(`${outDir}/${name}.png`, Buffer.from(data, "base64"));
  };

  await shoot(`${label}_before`);

  // Advance one beat the way a presenter does.
  await cdp.send("Input.dispatchKeyEvent", { type: "keyDown", key: "ArrowRight", code: "ArrowRight", windowsVirtualKeyCode: 39 });
  await cdp.send("Input.dispatchKeyEvent", { type: "keyUp", key: "ArrowRight", code: "ArrowRight", windowsVirtualKeyCode: 39 });

  // Screenshot latency must not accumulate, or every later frame is captured
  // long after the moment it claims to show.
  const started = Date.now();
  for (const at of frames) {
    await wait(Math.max(0, at - (Date.now() - started)));
    await shoot(`${label}_t${String(at).padStart(4, "0")}`);
  }
  cdp.close();
  console.log(`frames written to ${outDir}`);
} finally {
  chrome.kill();
}
