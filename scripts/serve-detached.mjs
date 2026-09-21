// Keeps the deck's dev server up.
//
// A plain background job stays in the launcher's process group and dies with
// it, which is why the server kept stopping between commands: every run ended
// with a graceful exit code 0, not a crash. This spawns a supervisor in its own
// session, and the supervisor restarts the server if it ever exits.
//
//   node scripts/serve-detached.mjs --port 3001     start (or report it is up)
//   node scripts/serve-detached.mjs --stop          stop the supervisor and server
import { spawn } from "node:child_process";
import { existsSync, openSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { setTimeout as wait } from "node:timers/promises";

const pidFile = "/tmp/cloak-dev.pid";
const logFile = "/tmp/cloak-dev.log";
const port = process.argv[process.argv.indexOf("--port") + 1] || "3001";

function alive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function runningSupervisor() {
  if (!existsSync(pidFile)) return null;
  const pid = Number(readFileSync(pidFile, "utf8").trim());
  return Number.isFinite(pid) && alive(pid) ? pid : null;
}

if (process.argv.includes("--stop")) {
  const pid = runningSupervisor();
  if (pid) {
    process.kill(-pid, "SIGTERM"); // the whole session, supervisor and server
    unlinkSync(pidFile);
    console.log(`stopped supervisor ${pid}`);
  } else {
    console.log("no supervisor running");
  }
  process.exit(0);
}

// The supervisor itself: restart the server whenever it exits.
if (process.argv.includes("--supervise")) {
  writeFileSync(pidFile, String(process.pid));
  const log = openSync(logFile, "a");
  let stopping = false;
  for (const signal of ["SIGTERM", "SIGINT"]) {
    process.on(signal, () => {
      stopping = true;
      process.exit(0);
    });
  }
  while (!stopping) {
    const child = spawn("npx", ["next", "dev", "--port", port], { stdio: ["ignore", log, log] });
    await new Promise((resolve) => child.on("exit", resolve));
    if (stopping) break;
    await wait(2000); // do not spin if it is failing to boot
  }
  process.exit(0);
}

const existing = runningSupervisor();
if (existing) {
  console.log(`already supervised by pid ${existing} on port ${port}`);
  process.exit(0);
}

const supervisor = spawn(process.execPath, [new URL(import.meta.url).pathname, "--supervise", "--port", port], {
  detached: true,
  stdio: "ignore",
});
supervisor.unref();
console.log(`supervisor ${supervisor.pid} started on port ${port}, logging to ${logFile}`);
