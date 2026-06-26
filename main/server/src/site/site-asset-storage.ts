import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERVER_ROOT = path.join(__dirname, "..", "..");
const SITE_DATA_DIR = path.join(SERVER_ROOT, "data", "site");
const LOGO_THUMBNAIL = "logo.png";
const VERSION_HEX_LEN = 16;

export function ensureSiteDir(): void {
    if (!fs.existsSync(SITE_DATA_DIR)) {
        fs.mkdirSync(SITE_DATA_DIR, { recursive: true });
    }
}

export function logoThumbnailPath(): string {
    return path.join(SITE_DATA_DIR, LOGO_THUMBNAIL);
}

export function writeThumbnail(thumbnailBuffer: Buffer): void {
    ensureSiteDir();
    fs.writeFileSync(logoThumbnailPath(), thumbnailBuffer);
}

export function logoVersion(): string | null {
    const p = logoThumbnailPath();
    if (!fs.existsSync(p)) return null;
    try {
        const stat = fs.statSync(p);
        return crypto.createHash("sha256").update(String(stat.mtimeMs)).digest("hex").slice(0, VERSION_HEX_LEN);
    } catch {
        return null;
    }
}
