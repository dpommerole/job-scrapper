import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import { createManualOpportunity, listOpportunities, updateOpportunity } from "./src/application/index.js";
import type { CreateManualOpportunityInput } from "./src/application/index.js";
import type { OpportunityStatus } from "./src/domain/index.js";
import { createAppDatabase, createSqliteDatabase, OpportunityRepository, runMigrations } from "./src/storage/index.js";

const opportunityStatuses = ["new", "interesting", "contacted", "replied", "interview", "offer", "rejected", "archived"];

export default defineConfig({
  plugins: [
    react(),
    {
      name: "job-tracker-opportunities-api",
      configureServer(server) {
        server.middlewares.use("/api/opportunities/", (request, response, next) => {
          if (request.method !== "PATCH") {
            next();
            return;
          }

          const id = decodeURIComponent((request.url ?? "").replace(/^\//, ""));
          let body = "";

          request.on("data", (chunk: Buffer) => {
            body += chunk.toString("utf8");
          });

          request.on("end", () => {
            const sqlite = createSqliteDatabase();

            try {
              const payload = parseUpdatePayload(body);
              if (!payload) {
                response.statusCode = 400;
                response.setHeader("Content-Type", "application/json");
                response.end(JSON.stringify({ error: "Invalid opportunity update payload" }));
                return;
              }

              runMigrations(sqlite);
              const db = createAppDatabase(sqlite);
              const opportunityRepository = new OpportunityRepository(db);
              const opportunity = updateOpportunity(
                {
                  id,
                  status: payload.status,
                  notes: payload.notes
                },
                { opportunityRepository }
              );

              if (!opportunity) {
                response.statusCode = 404;
                response.setHeader("Content-Type", "application/json");
                response.end(JSON.stringify({ error: "Opportunity not found" }));
                return;
              }

              response.setHeader("Content-Type", "application/json");
              response.end(JSON.stringify({ opportunity }));
            } catch (error) {
              response.statusCode = 500;
              response.setHeader("Content-Type", "application/json");
              response.end(
                JSON.stringify({
                  error: error instanceof Error ? error.message : "Failed to update opportunity"
                })
              );
            } finally {
              sqlite.close();
            }
          });
        });

        server.middlewares.use("/api/opportunities", (_request, response) => {
          if (_request.method === "POST") {
            let body = "";

            _request.on("data", (chunk: Buffer) => {
              body += chunk.toString("utf8");
            });

            _request.on("end", () => {
              const sqlite = createSqliteDatabase();

              try {
                const payload = parseCreatePayload(body);
                if (!payload) {
                  response.statusCode = 400;
                  response.setHeader("Content-Type", "application/json");
                  response.end(JSON.stringify({ errors: ["Invalid opportunity creation payload"] }));
                  return;
                }

                runMigrations(sqlite);
                const db = createAppDatabase(sqlite);
                const opportunityRepository = new OpportunityRepository(db);
                const result = createManualOpportunity(payload, { opportunityRepository });

                if (result.status === "invalid") {
                  response.statusCode = 400;
                  response.setHeader("Content-Type", "application/json");
                  response.end(JSON.stringify({ errors: result.errors }));
                  return;
                }

                response.statusCode = 201;
                response.setHeader("Content-Type", "application/json");
                response.end(JSON.stringify({ opportunity: result.opportunity }));
              } catch (error) {
                response.statusCode = 500;
                response.setHeader("Content-Type", "application/json");
                response.end(
                  JSON.stringify({
                    errors: [error instanceof Error ? error.message : "Failed to create opportunity"]
                  })
                );
              } finally {
                sqlite.close();
              }
            });
            return;
          }

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

function parseCreatePayload(body: string): CreateManualOpportunityInput | undefined {
  let payload: unknown;

  try {
    payload = JSON.parse(body);
  } catch {
    return undefined;
  }

  return payload && typeof payload === "object" ? (payload as CreateManualOpportunityInput) : undefined;
}

function parseUpdatePayload(body: string): { status: OpportunityStatus; notes?: string } | undefined {
  let payload: unknown;

  try {
    payload = JSON.parse(body);
  } catch {
    return undefined;
  }

  if (!payload || typeof payload !== "object") return undefined;

  const status = (payload as { status?: unknown }).status;
  const notes = (payload as { notes?: unknown }).notes;

  if (typeof status !== "string" || !opportunityStatuses.includes(status)) return undefined;
  if (typeof notes !== "undefined" && typeof notes !== "string") return undefined;

  return {
    status: status as OpportunityStatus,
    notes
  };
}
