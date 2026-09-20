// Advances one beat, then reports what the watcher layers are actually doing.
import { spawn } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTimeout as wait } from "node:timers/promises";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9334;
const profile = mkdtempSync(join(tmpdir(), "probe-"));
const url = "http://localhost:3000/present?slide=3&beat=1";

const chrome = spawn(CHROME, [
  `--remote-debugging-port=${PORT}`,
  "--headless=new",
  "--disable-gpu",
  "--no-first-run",
  "--window-size=1280,720",
  `--user-data-dir=${profile}`,
  url,
], { stdio: "ignore" });

async function page() {
  for (let i = 0; i < 40; i += 1) {
    try {
      const targets = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();
      const found = targets.find((t) => t.type === "page" && t.webSocketDebuggerUrl);
      if (found) return found;
    } catch {}
    await wait(250);
  }
  throw new Error("no page");
}

function connect(wsUrl) {
  const socket = new WebSocket(wsUrl);
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
    m.error ? p.reject(new Error(m.error.message)) : p.resolve(m.result);
  });
  return {
    ready,
    send: (method, params = {}) => {
      const mine = (id += 1);
      socket.send(JSON.stringify({ id: mine, method, params }));
      return new Promise((res, rej) => pending.set(mine, { resolve: res, reject: rej }));
    },
    close: () => socket.close(),
  };
}

const EXPR = `(() => {
  const paths = [...document.querySelectorAll('svg path')];
  const cloak = paths.find(p => (p.getAttribute('d') || '').startsWith('M-120 1800'));
  if (!cloak) return { found: false, pathCount: paths.length };
  const box = cloak.getBoundingClientRect();
  let node = cloak, chain = [], effective = 1;
  while (node && node !== document.body) {
    const cs = getComputedStyle(node);
    effective *= parseFloat(cs.opacity);
    if (cs.opacity !== '1') {
      chain.push({ cls: (node.getAttribute('class') || '').slice(0, 44), opacity: cs.opacity });
    }
    node = node.parentElement;
  }
  return {
    box: { x: Math.round(box.x), y: Math.round(box.y), w: Math.round(box.width), h: Math.round(box.height) },
    effectiveOpacity: Number(effective.toFixed(3)),
    fadedAncestors: chain,
  };
})()`;

try {
  const target = await page();
  const cdp = connect(target.webSocketDebuggerUrl);
  await cdp.ready;
  await cdp.send("Runtime.enable");
  await wait(2500);

  const read = async (tag) => {
    const { result } = await cdp.send("Runtime.evaluate", { expression: EXPR, returnByValue: true });
    console.log(tag, JSON.stringify(result.value, null, 2));
  };

  await cdp.send("Input.dispatchKeyEvent", { type: "keyDown", key: "ArrowRight", code: "ArrowRight", windowsVirtualKeyCode: 39 });
  await cdp.send("Input.dispatchKeyEvent", { type: "keyUp", key: "ArrowRight", code: "ArrowRight", windowsVirtualKeyCode: 39 });
  const started = Date.now();
  for (const at of [200, 400, 600, 900, 1200]) {
    await wait(Math.max(0, at - (Date.now() - started)));
    await read(`t=${at}ms`);
  }
  cdp.close();
} finally {
  chrome.kill();
}
