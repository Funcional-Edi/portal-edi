import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./config/vitest.setup.ts"],
    include: ["core/**/*.test.ts", "modules/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["core/**/*.ts", "modules/**/*.ts"],
      exclude: ["**/*.test.ts", "**/module.ts", "core/auth/index.ts"],
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("../", import.meta.url)),
    },
  },
});
