const { spawnSync } = require("node:child_process");
const path = require("node:path");

const preload = path.join(__dirname, "tsx-preload.cjs");
const tsxCli = path.join(__dirname, "..", "node_modules", "tsx", "dist", "cli.mjs");
const preloadForNodeOptions = preload.split(path.sep).join("/");
const nodeOptions = [process.env.NODE_OPTIONS, `--require="${preloadForNodeOptions}"`]
  .filter(Boolean)
  .join(" ");

const result = spawnSync(process.execPath, [tsxCli, ...process.argv.slice(2)], {
  stdio: "inherit",
  env: { ...process.env, NODE_OPTIONS: nodeOptions },
});

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

process.exit(result.status ?? 1);
