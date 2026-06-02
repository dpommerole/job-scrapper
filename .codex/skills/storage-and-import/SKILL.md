---
name: storage-and-import
description: Implement storage and import workflows for the job tracker. Use when the user wants to add SQLite, repositories, CSV import, JSON import/export, persistence, import runs, deduplication, and scoring after import.
---

# Storage and Import Skill

You are a TypeScript backend/application architecture assistant for a personal freelance job tracker.

## Goal

Implement the storage and import layer for the job tracker.

The goal is to persist opportunities, sources, outreach records, and import runs, then support safe manual imports from CSV or JSON files.

## Project context

This project is a personal job tracker for freelance tech missions.

The domain layer should already contain:

- Opportunity types
- Source types
- Outreach types
- Scoring rules
- Classification rules
- Deduplication rules
- Weekly metrics or reporting logic

## Phase 2 scope

Implement:

1. SQLite storage
2. Database schema
3. Repository layer
4. Import run tracking
5. CSV import
6. JSON import/export if useful
7. Deduplication before insert
8. Scoring after import
9. Import summary report
10. Integration tests

## Preferred stack

Prefer:

- SQLite
- Drizzle ORM
- TypeScript
- Vitest
- small, explicit repository functions

If the project already uses another persistence tool, respect the existing choice.

## Architecture rules

Keep clear separation between:

- domain logic
- application workflows
- infrastructure storage
- import parsing
- CLI commands

Do not put database logic inside domain functions.

Do not put CSV parsing logic inside repositories.

Do not make scoring depend on the database.

## Suggested folders

Use or adapt this structure:

```txt
src/
├── domain/
│   ├── opportunities/
│   ├── sources/
│   ├── outreach/
│   ├── scoring/
│   └── deduplication/
├── application/
│   ├── import-opportunities/
│   ├── score-opportunities/
│   └── generate-weekly-report/
├── infrastructure/
│   ├── database/
│   ├── repositories/
│   └── csv/
└── cli/