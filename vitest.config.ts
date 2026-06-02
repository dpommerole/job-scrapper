import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environmentMatchGlobs: [["tests/ui/**/*.test.tsx", "jsdom"]]
  }
});
