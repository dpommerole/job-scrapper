import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import { listOpportunities } from "./src/application/index.js";
import { createAppDatabase, createSqliteDatabase, OpportunityRepository, runMigrations } from "./src/storage/index.js";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "job-tracker-opportunities-api",
      configureServer(server) {
        server.middlewares.use("/api/opportunities", (_request, response) => {
          const sqlite = createSqliteDatabase();

          try {
            runMigrations(sqlite);
            const db = createAppDatabase(sqlite);
            const opportunityRepository = new OpportunityRepository(db);
            const opportunities = listOpportunities({ opportunityRepository });

            response.setHeader("Content-Type", "application/json");
            response.end(JSON.stringify({ opportunities }));
          } catch (error) {
            response.statusCode = 500;
            response.setHeader("Content-Type", "application/json");
            response.end(
              JSON.stringify({
                error: error instanceof Error ? error.message : "Failed to load opportunities"
              })
            );
          } finally {
            sqlite.close();
          }
        });
      }
    }
  ],
  test: {
    environmentMatchGlobs: [["tests/ui/**/*.test.tsx", "jsdom"]]
  }
});
