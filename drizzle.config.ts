import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/storage/schema.ts",
  out: "./migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: "./data/job-tracker.sqlite"
  }
});
