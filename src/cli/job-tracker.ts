import { runJobTrackerCli } from "./jobTrackerCli.js";

const exitCode = runJobTrackerCli(process.argv.slice(2), {
  databasePath: process.env.JOB_TRACKER_DB_PATH
});
process.exitCode = exitCode;
