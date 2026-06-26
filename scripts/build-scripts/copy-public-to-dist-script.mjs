#!/usr/bin/env node
// Explicit public/ -> dist/ copy step. Backfills rolldown-vite's publicDir
// handling which silently no-ops the copy in vite 8.0.16 + rolldown 1.0.3.
// Respects SKIP_PUBLIC=1 so the fast build variant keeps its tile-copy skip.
//
// Runs after `vite build` in build:dashboard:bundle. dist/ already exists
// (vite created it for the JS chunks + index.html). cpSync recursive merges
// public/* into dist/* without clobbering vite's output.

import fs from "node:fs";
import path from "node:path";
import url from "node:url";

const here = path.dirname(url.fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..", "..");
const publicDir = path.join(repoRoot, "public");
const distDir = path.join(repoRoot, "dist");

const skipPublic = process.env.SKIP_PUBLIC === "1" || process.env.SKIP_PUBLIC === "true";

if (skipPublic) {
    console.log("[copy-public] SKIP_PUBLIC=1 — skipping public -> dist copy");
    process.exit(0);
}

if (!fs.existsSync(publicDir)) {
    console.log(`[copy-public] no public directory at ${publicDir} — nothing to copy`);
    process.exit(0);
}

if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

const startedAt = Date.now();
fs.cpSync(publicDir, distDir, { recursive: true, errorOnExist: false, force: true });
const elapsed = Date.now() - startedAt;

let copiedCount = 0;
let totalBytes = 0;
const stack = [distDir];
while (stack.length > 0) {
    const dir = stack.pop();
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            stack.push(full);
        } else if (entry.isFile()) {
            copiedCount += 1;
            totalBytes += fs.statSync(full).size;
        }
    }
}

const mb = (totalBytes / 1024 / 1024).toFixed(2);
console.log(`[copy-public] copied public/ -> dist/ in ${elapsed}ms (dist now contains ${copiedCount} files, ${mb} MB)`);
