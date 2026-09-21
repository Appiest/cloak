// Exports every beat of the deck to a single landscape PDF.
//
// Walks the deck with the arrow key rather than deep-linking each beat, so each
// frame is the state a presenter actually arrives at, then prints the captured
// frames through Chrome itself — no image library needed.
//
//   node scripts/export-pdf.mjs --out cloak-deck.pdf [--settle 4000] [--notes]
import { spawn } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTimeout as wait } from "node:timers/promises";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9340;
const CANVAS = { w: 1920, h: 1080 };

function arg(name, fallback) {
  const at = process.argv.indexOf(`--${name}`);
  return at === -1 ? fallback : process.argv[at + 1];
}

const outPath = arg("out", "cloak-deck.pdf");
const settle = Number(arg("settle", 4000));
const keepNotes = process.argv.includes("--notes");
const origin = arg("origin", "http://localhost:3001");
const work = mkdtempSync(join(tmpdir(), "deck-pdf-"));

const chrome = spawn(CHROME, [
  `--remote-debugging-port=${PORT}`,
  "--headless=new",
  "--hide-scrollbars",
  "--no-first-run",
  `--window-size=${CANVAS.w},${CANVAS.h}`,
  `--user-data-dir=${join(work, "profile")}`,
  `${origin}/present?slide=1`,
], { stdio: "ignore" });

function connect(url) {
  const socket = new WebSocket(url);
  const pending = new Map();
  let id = 0;
  const ready = new Promise((res, rej) => {
    socket.addEventListener("open", res, { once: true });
    socket.addEventListener("error", rej, { once: true });
  });
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    const settleCall = pending.get(message.id);
    if (!settleCall) return;
    pending.delete(message.id);
    settleCall(message.result);
  });
  return {
    ready,
    send: (method, params = {}) => {
      const mine = ++id;
      socket.send(JSON.stringify({ id: mine, method, params }));
      return new Promise((res) => pending.set(mine, res));
    },
    close: () => socket.close(),
  };
}

async function findPage() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const targets = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();
      const page = targets.find((t) => t.type === "page" && t.webSocketDebuggerUrl);
      if (page) return page;
    } catch {
      // still starting
    }
    await wait(250);
  }
  throw new Error("Chrome never exposed a debuggable page");
}

try {
  const target = await findPage();
  const cdp = connect(target.webSocketDebuggerUrl);
  await cdp.ready;
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await wait(3000);

  if (!keepNotes) {
    await cdp.send("Runtime.evaluate", {
      expression: `(() => {
        const style = document.createElement('style');
        // nextjs-portal is the dev-mode indicator badge, which is not part of the deck.
        style.textContent = '[data-rehearsal]{display:none !important} nextjs-portal{display:none !important}';
        document.head.appendChild(style);
      })()`,
    });
  }

  const positionOf = async () => {
    const { result } = await cdp.send("Runtime.evaluate", {
      returnByValue: true,
      expression: `document.querySelector('[aria-live]')?.textContent || ''`,
    });
    return result.value;
  };

  const frames = [];
  let previous = null;
  for (let step = 0; step < 200; step += 1) {
    await wait(settle);
    const where = await positionOf();
    if (where === previous) break; // the deck stops advancing at the last beat
    previous = where;

    const { data } = await cdp.send("Page.captureScreenshot", { format: "jpeg", quality: 92, captureBeyondViewport: false });
    const file = join(work, `frame-${String(frames.length).padStart(2, "0")}.jpg`);
    writeFileSync(file, Buffer.from(data, "base64"));
    frames.push({ file, where });
    process.stdout.write(`  ${where}\n`);

    await cdp.send("Input.dispatchKeyEvent", { type: "keyDown", key: "ArrowRight", code: "ArrowRight", windowsVirtualKeyCode: 39 });
    await cdp.send("Input.dispatchKeyEvent", { type: "keyUp", key: "ArrowRight", code: "ArrowRight", windowsVirtualKeyCode: 39 });
  }

  const pages = frames
    .map((frame) => `<img src="file://${frame.file}" alt="${frame.where}">`)
    .join("\n");
  const sheet = join(work, "sheet.html");
  writeFileSync(sheet, `<!doctype html><meta charset="utf-8"><style>
    @page { size: ${CANVAS.w}px ${CANVAS.h}px; margin: 0 }
    html, body { margin: 0; padding: 0; background: #000 }
    img { display: block; width: ${CANVAS.w}px; height: ${CANVAS.h}px; break-after: page }
    img:last-child { break-after: auto }
  </style>${pages}`);

  await cdp.send("Page.navigate", { url: `file://${sheet}` });
  await wait(3000);
  const { data } = await cdp.send("Page.printToPDF", {
    printBackground: true,
    preferCSSPageSize: true,
    marginTop: 0,
    marginBottom: 0,
    marginLeft: 0,
    marginRight: 0,
  });
  writeFileSync(outPath, Buffer.from(data, "base64"));
  console.log(`\n${frames.length} beats -> ${outPath}`);
  cdp.close();
} finally {
  chrome.kill();
}
