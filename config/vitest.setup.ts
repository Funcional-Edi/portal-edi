import { cpSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { vi } from "vitest";

let tempProbe: string | undefined;
try {
  tempProbe = mkdtempSync(path.join(os.tmpdir(), "portal-edi-vitest-probe-"));
  cpSync(path.join(process.cwd(), "content"), path.join(tempProbe, "content"), { recursive: true });
  rmSync(tempProbe, { recursive: true, force: true });
} catch {
  if (tempProbe) rmSync(tempProbe, { recursive: true, force: true });
  const fallbackTemp = path.join(process.cwd(), ".tmp-vitest");
  mkdirSync(fallbackTemp, { recursive: true });
  process.env.TEMP = fallbackTemp;
  process.env.TMP = fallbackTemp;
  process.env.TMPDIR = fallbackTemp;
}

vi.mock("next/cache", () => ({
  unstable_cache: vi.fn((loader: (...args: unknown[]) => unknown) => {
    return (...args: unknown[]) => loader(...args);
  }),
  revalidateTag: vi.fn(),
}));
