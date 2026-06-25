import { existsSync, rmSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const APP_ROOT = resolve(__dirname, "..", "..");

const SIGNPATH_API_KEY = process.env.SIGNPATH_API_KEY;
const SIGNPATH_ORG_ID = process.env.SIGNPATH_ORG_ID;
const SIGNPATH_PROJECT_SLUG = process.env.SIGNPATH_PROJECT_SLUG;
const SIGNPATH_POLICY_SLUG = process.env.SIGNPATH_POLICY_SLUG;

const MARKER_DIR = resolve(APP_ROOT, "desktop-dist");
const MARKER_PATH = resolve(MARKER_DIR, ".signpath-signed");

if (existsSync(MARKER_PATH)) rmSync(MARKER_PATH, { force: true });

if (!SIGNPATH_API_KEY) {
    process.stdout.write("[signpath] skip: SIGNPATH_API_KEY not set (pre-approval). Building unsigned.\n");
    process.exit(0);
}

if (!SIGNPATH_ORG_ID || !SIGNPATH_PROJECT_SLUG || !SIGNPATH_POLICY_SLUG) {
    process.stderr.write("[signpath] missing required env vars: SIGNPATH_ORG_ID, SIGNPATH_PROJECT_SLUG, SIGNPATH_POLICY_SLUG\n");
    process.exit(1);
}

process.stderr.write("[signpath] not yet implemented — fill this in once SignPath approves the ClanSocket OSS application.\n");
process.stderr.write("[signpath] integration plan:\n");
process.stderr.write("[signpath]   1. Find .exe artifact in main/electron/dist/\n");
process.stderr.write("[signpath]   2. POST to SignPath signing API with org id + project + policy + api key\n");
process.stderr.write("[signpath]   3. Poll for completion (typically 5-30s)\n");
process.stderr.write("[signpath]   4. Download signed binary, overwrite the unsigned .exe in main/electron/dist/\n");
process.stderr.write("[signpath]   5. Write success marker to " + MARKER_PATH + " so provide-script knows the artifact is signed\n");
process.exit(1);

// When signing succeeds, write the marker:
// if (!existsSync(MARKER_DIR)) mkdirSync(MARKER_DIR, { recursive: true });
// writeFileSync(MARKER_PATH, new Date().toISOString() + "\n", "utf8");
