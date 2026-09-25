import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "server-only": fileURLToPath(new URL("./src/test/empty.ts", import.meta.url)),
      "@": fileURLToPath(new URL("./src/", import.meta.url)),
    },
  },
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
    env: { PGLITE_DATA_DIR: "memory://", NODE_ENV: "test" },
    testTimeout: 20_000,
    hookTimeout: 30_000,
  },
});
