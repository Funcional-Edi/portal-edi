/**
 * Observa `content/` e `docs/` e re-sincroniza o cofre Obsidian.
 * Uso: npm run obsidian:watch
 */
import { watch } from "node:fs";
import path from "node:path";

import { syncObsidianVault } from "./sync-obsidian-vault";

const ROOT = process.cwd();
const WATCH_DIRS = [
  path.join(ROOT, "content", "projects"),
  path.join(ROOT, "docs"),
];

let timer: ReturnType<typeof setTimeout> | undefined;
let running = false;

async function runSync(reason: string): Promise<void> {
  if (running) return;
  running = true;
  try {
    console.log(`\n[obsidian:watch] ${reason}`);
    await syncObsidianVault();
  } catch (error) {
    console.error("[obsidian:watch] erro:", error);
  } finally {
    running = false;
  }
}

function scheduleSync(reason: string): void {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    void runSync(reason);
  }, 400);
}

async function main(): Promise<void> {
  console.log("[obsidian:watch] Iniciando sync inicial…");
  await runSync("sync inicial");

  for (const dir of WATCH_DIRS) {
    watch(dir, { recursive: true }, (_event, filename) => {
      if (!filename) return;
      if (filename.includes("node_modules")) return;
      scheduleSync(`alteração em ${filename}`);
    });
    console.log(`[obsidian:watch] Observando ${dir}`);
  }

  console.log("[obsidian:watch] Pronto — deixe este terminal aberto.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
