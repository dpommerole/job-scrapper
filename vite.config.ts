import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import {
  createManualOpportunity,
  createOutreachDraft,
  listOpportunities,
  listOutreach,
  listReports,
  readReport,
  updateOpportunity,
  updateOutreach
} from "./src/application/index.js";
import type { CreateManualOpportunityInput, CreateOutreachDraftInput, UpdateOutreachInput } from "./src/application/index.js";
import type { OpportunityStatus, OutreachChannel, OutreachStatus } from "./src/domain/index.js";
import {
  createAppDatabase,
  createSqliteDatabase,
  OpportunityRepository,
  OutreachRepository,
  runMigrations
} from "./src/storage/index.js";

const opportunityStatuses = ["new", "interesting", "contacted", "replied", "interview", "offer", "rejected", "archived"];
const outreachStatuses = ["draft", "sent", "replied", "follow_up_needed", "closed"];
const outreachChannels = ["email", "linkedin", "platform-message", "phone", "other"];

export default defineConfig({
  plugins: [
    react(),
    {
      name: "job-tracker-opportunities-api",
      configureServer(server) {
        server.middlewares.use("/api/reports/", (request, response, next) => {
          if (request.method !== "GET") {
            next();
            return;
          }

          const id = decodeURIComponent((request.url ?? "").replace(/^\//, ""));
          if (!id) {
            next();
            return;
          }

          const report = readReport({ id });

          if (!report) {
            response.statusCode = 404;
            response.setHeader("Content-Type", "application/json");
            response.end(JSON.stringify({ error: "Report not found" }));
            return;
          }

          response.setHeader("Content-Type", "application/json");
          response.end(JSON.stringify({ report }));
        });

        server.middlewares.use("/api/reports", (request, response, next) => {
          if (request.method !== "GET") {
            next();
            return;
          }

          response.setHeader("Content-Type", "application/json");
          response.end(JSON.stringify({ reports: listReports() }));
        });

        server.middlewares.use("/api/outreach/", (request, response, next) => {
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
              const payload = parseOutreachUpdatePayload(body);
              if (!payload) {
                response.statusCode = 400;
                response.setHeader("Content-Type", "application/json");
                response.end(JSON.stringify({ error: "Invalid outreach update payload" }));
                return;
              }

              runMigrations(sqlite);
              const db = createAppDatabase(sqlite);
              const outreachRepository = new OutreachRepository(db);
              const outreach = updateOutreach({ id, ...payload }, { outreachRepository });

              if (!outreach) {
                response.statusCode = 404;
                response.setHeader("Content-Type", "application/json");
                response.end(JSON.stringify({ error: "Outreach item not found" }));
                return;
              }

              response.setHeader("Content-Type", "application/json");
              response.end(JSON.stringify({ outreach }));
            } catch (error) {
              response.statusCode = 500;
              response.setHeader("Content-Type", "application/json");
              response.end(
                JSON.stringify({
                  error: error instanceof Error ? error.message : "Failed to update outreach"
                })
              );
            } finally {
              sqlite.close();
            }
          });
        });

        server.middlewares.use("/api/outreach", (request, response) => {
          if (request.method === "POST") {
            let body = "";

            request.on("data", (chunk: Buffer) => {
              body += chunk.toString("utf8");
            });

            request.on("end", () => {
              const sqlite = createSqliteDatabase();

              try {
                const payload = parseOutreachCreatePayload(body);
                if (!payload) {
                  response.statusCode = 400;
                  response.setHeader("Content-Type", "application/json");
                  response.end(JSON.stringify({ error: "Invalid outreach creation payload" }));
                  return;
                }

                runMigrations(sqlite);
                const db = createAppDatabase(sqlite);
                const opportunityRepository = new OpportunityRepository(db);
                const outreachRepository = new OutreachRepository(db);
                const result = createOutreachDraft(payload, { opportunityRepository, outreachRepository });

                if (result.status === "missing-opportunity") {
                  response.statusCode = 404;
                  response.setHeader("Content-Type", "application/json");
                  response.end(JSON.stringify({ error: "Opportunity not found" }));
                  return;
                }

                response.statusCode = 201;
                response.setHeader("Content-Type", "application/json");
                response.end(JSON.stringify({ outreach: result.outreach }));
              } catch (error) {
                response.statusCode = 500;
                response.setHeader("Content-Type", "application/json");
                response.end(
                  JSON.stringify({
                    error: error instanceof Error ? error.message : "Failed to create outreach draft"
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
            const outreachRepository = new OutreachRepository(db);
            const outreachItems = listOutreach({ outreachRepository });

            response.setHeader("Content-Type", "application/json");
            response.end(JSON.stringify({ outreachItems }));
          } catch (error) {
            response.statusCode = 500;
            response.setHeader("Content-Type", "application/json");
            response.end(
              JSON.stringify({
                error: error instanceof Error ? error.message : "Failed to load outreach"
              })
            );
          } finally {
            sqlite.close();
          }
        });

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
    exclude: ["dist/**", "node_modules/**"]
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

function parseOutreachCreatePayload(body: string): CreateOutreachDraftInput | undefined {
  let payload: unknown;

  try {
    payload = JSON.parse(body);
  } catch {
    return undefined;
  }

  if (!payload || typeof payload !== "object") return undefined;

  const opportunityId = (payload as { opportunityId?: unknown }).opportunityId;
  const channel = (payload as { channel?: unknown }).channel;
  const followUpAt = (payload as { followUpAt?: unknown }).followUpAt;
  const notes = (payload as { notes?: unknown }).notes;
  const subject = (payload as { subject?: unknown }).subject;
  const message = (payload as { message?: unknown }).message;

  if (typeof opportunityId !== "string" || !opportunityId.trim()) return undefined;
  if (typeof channel !== "undefined" && (typeof channel !== "string" || !outreachChannels.includes(channel))) return undefined;
  if (typeof followUpAt !== "undefined" && typeof followUpAt !== "string") return undefined;
  if (typeof notes !== "undefined" && typeof notes !== "string") return undefined;
  if (typeof subject !== "undefined" && typeof subject !== "string") return undefined;
  if (typeof message !== "undefined" && typeof message !== "string") return undefined;

  return {
    opportunityId,
    channel: channel as OutreachChannel | undefined,
    subject,
    message,
    followUpAt,
    notes
  };
}

function parseOutreachUpdatePayload(body: string): Omit<UpdateOutreachInput, "id"> | undefined {
  let payload: unknown;

  try {
    payload = JSON.parse(body);
  } catch {
    return undefined;
  }

  if (!payload || typeof payload !== "object") return undefined;

  const status = (payload as { status?: unknown }).status;
  const channel = (payload as { channel?: unknown }).channel;
  const followUpAt = (payload as { followUpAt?: unknown }).followUpAt;
  const notes = (payload as { notes?: unknown }).notes;

  if (typeof status !== "undefined" && (typeof status !== "string" || !outreachStatuses.includes(status))) return undefined;
  if (typeof channel !== "undefined" && (typeof channel !== "string" || !outreachChannels.includes(channel))) return undefined;
  if (typeof followUpAt !== "undefined" && typeof followUpAt !== "string") return undefined;
  if (typeof notes !== "undefined" && typeof notes !== "string") return undefined;

  return {
    status: status as OutreachStatus | undefined,
    channel: channel as OutreachChannel | undefined,
    followUpAt,
    notes
  };
}
