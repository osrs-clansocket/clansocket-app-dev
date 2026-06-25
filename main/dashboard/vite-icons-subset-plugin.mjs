// Vite plugin: regenerate icon CSS subsets when source/allowlist changes.
//
// Runs the subset script at:
// - configResolved (once at startup, before Vite reads CSS) — ensures the eager
//   root has a fresh subset to import
// - HMR change events for *.ts/*.css under main/dashboard/src + icons-allowlist.json
//
// Production builds invoke this same plugin via the dev/build path, so prod
// always rebuilds the subset from the current source.

import { spawnSync } from "node:child_process";
import path from "node:path";
import url from "node:url";

const here = path.dirname(url.fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..", "..");
const scriptPath = path.resolve(repoRoot, "scripts", "build-scripts", "build-icons-subset-script.mjs");
const dashSrc = path.resolve(repoRoot, "main", "dashboard", "src");
const watchTriggers = [
    path.resolve(dashSrc, "icons", "icons-allowlist.json"),
];

let runId = 0;
let lastRunAt = 0;
const DEBOUNCE_MS = 250;

function runSubsetScript(reason, { failHard = false } = {}) {
    const id = ++runId;
    const startedAt = Date.now();
    const result = spawnSync("node", [scriptPath], { stdio: "inherit", cwd: repoRoot });
    lastRunAt = Date.now();
    if (result.status !== 0) {
        const msg = `[vite-icons-subset] (#${id}) subset script exited ${result.status} | reason=${reason}`;
        console.error(msg);
        if (failHard) {
            throw new Error(msg + " — Vite build aborted because subset CSS would be missing or stale.");
        }
        return false;
    }
    console.log(`[vite-icons-subset] (#${id}) subset regenerated in ${lastRunAt - startedAt}ms | reason=${reason}`);
    return true;
}

function shouldTriggerRebuild(filePath) {
    if (watchTriggers.includes(filePath)) return true;
    if (!filePath.startsWith(dashSrc)) return false;
    if (filePath.includes("auto-gen")) return false;
    if (!/\.(ts|tsx|css)$/.test(filePath)) return false;
    return true;
}

export default function iconsSubsetPlugin() {
    return {
        name: "icons-subset",
        configResolved(config) {
            // Always run on startup — covers cold start AND ensures prod builds
            // emit the subset before Vite reads the CSS.
            // Builds fail hard if the script errors (subset CSS would be missing/stale);
            // dev mode just logs the error and lets the user fix it.
            runSubsetScript("startup", { failHard: config.command === "build" });
        },
        handleHotUpdate(ctx) {
            if (!shouldTriggerRebuild(ctx.file)) return;
            if (Date.now() - lastRunAt < DEBOUNCE_MS) return;
            runSubsetScript(`change:${path.relative(repoRoot, ctx.file)}`);
        },
    };
}
