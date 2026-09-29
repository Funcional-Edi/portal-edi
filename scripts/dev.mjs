import { spawn } from "node:child_process";
import { resolve } from "node:path";

const nextCli = resolve("node_modules/next/dist/bin/next");
const children = [
  spawn(process.execPath, [nextCli, "dev", "-p", "3002"], {
    stdio: "inherit",
    env: { ...process.env, NEXT_DIST_DIR: ".next" },
  }),
  spawn(process.execPath, [nextCli, "dev", "-p", "3003"], {
    stdio: "inherit",
    env: {
      ...process.env,
      AUTH_SECRET: process.env.AUTH_SECRET || "dev-auth-secret-e2e",
      AUTH_URL: "http://localhost:3003",
      DEV_AUTH_ENABLED: "true",
      NEXT_DIST_DIR: ".next-e2e",
    },
  }),
];

let stopping = false;

function stop(exitCode = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) child.kill();
  process.exitCode = exitCode;
}

for (const child of children) {
  child.once("error", () => stop(1));
  child.once("exit", (code) => {
    if (!stopping) stop(code ?? 1);
  });
}

process.once("SIGINT", () => stop());
process.once("SIGTERM", () => stop());
