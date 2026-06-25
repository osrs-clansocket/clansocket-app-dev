#!/usr/bin/env node
// Cross-platform wrapper for `vite build` with SKIP_PUBLIC=1. The dashboard's
// public/ tree contains ~110k OSRS world-map tile webps; copying them into
// dist/ adds significant wall-clock + occasional Windows file-lock issues
// (rmSync can hit ENOTEMPTY when prior killed builds left handles). For
// iterative code changes that don't touch /public, this fast variant skips
// the copy entirely. Use the regular `build:dashboard:bundle` when /public
// assets need to be in dist/ (any production-staged build).

import { spawnSync } from "node:child_process";

const env = { ...process.env, SKIP_PUBLIC: "1" };
const result = spawnSync("vite", ["build", "--config", "main/dashboard/vite.config.ts"], {
    stdio: "inherit",
    shell: true,
    env,
});
process.exit(result.status ?? 1);
