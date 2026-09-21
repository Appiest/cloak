// Clicks through the deck at a chosen pace and reports dropped frames per beat.
// "Choppy when clicking fast" is either dropped frames or animation retargeting;
// this tells you which, and where.
import { spawn } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTimeout as wait } from "node:timers/promises";

const PORT = 9337;
const pace = Number(process.argv[process.argv.indexOf("--pace") + 1] || 400);
const steps = Number(process.argv[process.argv.indexOf("--steps") + 1] || 24);
const profile = mkdtempSync(join(tmpdir(), "jank-"));

const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", [
  `--remote-debugging-port=${PORT}`, "--headless=new",
  "--no-first-run", "--window-size=1280,720", `--user-data-dir=${profile}`,
  "http://localhost:3001/present?slide=1",
], { stdio: "ignore" });

function connect(url) {
  const socket = new WebSocket(url);
  const pending = new Map();
  let id = 0;
  const ready = new Promise((res, rej) => {
    socket.addEventListener("open", res, { once: true });
    socket.addEventListener("error", rej, { once: true });
  });
  socket.addEventListener("message", (e) => {
    const m = JSON.parse(e.data);
    const p = pending.get(m.id);
    if (!p) return;
    pending.delete(m.id);
    p(m.result);
  });
  return {
    ready,
    send: (method, params = {}) => {
      const mine = ++id;
      socket.send(JSON.stringify({ id: mine, method, params }));
      return new Promise((r) => pending.set(mine, r));
    },
    close: () => socket.close(),
  };
}

try {
  let target;
  for (let i = 0; i < 40 && !target; i += 1) {
    try {
      target = (await (await fetch(`http://127.0.0.1:${PORT}/json`)).json())
        .find((t) => t.type === "page" && t.webSocketDebuggerUrl);
    } catch {}
    if (!target) await wait(250);
  }
  const cdp = connect(target.webSocketDebuggerUrl);
  await cdp.ready;
  await cdp.send("Runtime.enable");
  await wait(3000);

  await cdp.send("Runtime.evaluate", { expression: `
    window.__frames = [];
    let last = performance.now();
    const tick = (now) => { window.__frames.push(now - last); last = now; requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
    window.__marks = [];
  ` });

  for (let i = 0; i < steps; i += 1) {
    await cdp.send("Runtime.evaluate", { expression: `window.__marks.push({ at: window.__frames.length, beat: document.querySelector('[aria-live]')?.textContent })` });
    await cdp.send("Input.dispatchKeyEvent", { type: "keyDown", key: "ArrowRight", code: "ArrowRight", windowsVirtualKeyCode: 39 });
    await cdp.send("Input.dispatchKeyEvent", { type: "keyUp", key: "ArrowRight", code: "ArrowRight", windowsVirtualKeyCode: 39 });
    await wait(pace);
  }

  const { result } = await cdp.send("Runtime.evaluate", { returnByValue: true, expression: `(() => {
    const f = window.__frames.slice(1);
    const marks = window.__marks;
    const perBeat = marks.map((m, i) => {
      const from = m.at, to = i + 1 < marks.length ? marks[i + 1].at : f.length;
      const slice = f.slice(from, to);
      const dropped = slice.filter(d => d > 33).length;
      return { beat: m.beat, frames: slice.length, dropped, worst: Math.round(Math.max(0, ...slice)) };
    });
    return {
      totalFrames: f.length,
      median: Math.round(f.slice().sort((a,b)=>a-b)[Math.floor(f.length/2)]),
      dropped: f.filter(d => d > 33).length,
      worst: Math.round(Math.max(...f)),
      perBeat,
    };
  })()` });

  const r = result.value;
  console.log(`pace ${pace}ms  frames ${r.totalFrames}  median ${r.median}ms  dropped(>33ms) ${r.dropped}  worst ${r.worst}ms`);
  for (const b of r.perBeat) {
    if (b.dropped > 0) console.log(`  ${String(b.beat).padEnd(34)} dropped ${String(b.dropped).padStart(3)}  worst ${b.worst}ms`);
  }
  cdp.close();
} finally {
  chrome.kill();
}
