import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ensureSiteDir } from "./site-asset-storage.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_DATA_DIR = path.join(__dirname, "..", "..", "data", "site");
const LOGO_SCALE = "logo-scale.json";

export function logoScalePath(): string {
    return path.join(SITE_DATA_DIR, LOGO_SCALE);
}

export function readLogoScale(): number | null {
    const p = logoScalePath();
    if (!fs.existsSync(p)) return null;
    try {
        const raw = fs.readFileSync(p, "utf8");
        const parsed = JSON.parse(raw) as { scale?: unknown };
        const scale = parsed.scale;
        return typeof scale === "number" ? scale : null;
    } catch {
        return null;
    }
}

export function writeLogoScale(scale: number): void {
    ensureSiteDir();
    fs.writeFileSync(logoScalePath(), JSON.stringify({ scale }), "utf8");
}
