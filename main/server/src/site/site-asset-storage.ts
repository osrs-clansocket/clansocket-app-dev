import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERVER_ROOT = path.join(__dirname, "..", "..");
const SITE_DATA_DIR = path.join(SERVER_ROOT, "data", "site");
const LOGO_THUMBNAIL = "logo.png";
const LOGO_RECORD = "logo-record.json";
const LOGO_RECORD_BROTLI = "logo-record.json.br";
const LOGO_META = "logo-meta.json";
const LOGO_SCALE = "logo-scale.json";

export function ensureSiteDir(): void {
    if (!fs.existsSync(SITE_DATA_DIR)) {
        fs.mkdirSync(SITE_DATA_DIR, { recursive: true });
    }
}

export function logoThumbnailPath(): string {
    return path.join(SITE_DATA_DIR, LOGO_THUMBNAIL);
}

export function logoRecordPath(): string {
    return path.join(SITE_DATA_DIR, LOGO_RECORD);
}

export function logoBrotliPath(): string {
    return path.join(SITE_DATA_DIR, LOGO_RECORD_BROTLI);
}

export function logoMetaPath(): string {
    return path.join(SITE_DATA_DIR, LOGO_META);
}

export function logoScalePath(): string {
    return path.join(SITE_DATA_DIR, LOGO_SCALE);
}

export function readLogoRecord(): string | null {
    const p = logoRecordPath();
    if (!fs.existsSync(p)) return null;
    try {
        return fs.readFileSync(p, "utf8");
    } catch {
        return null;
    }
}

function writeUtf8(filePath: string, data: string): void {
    ensureSiteDir();
    fs.writeFileSync(filePath, data, "utf8");
}

export function writeRecordRaw(envelopeRaw: string): void {
    writeUtf8(logoRecordPath(), envelopeRaw);
}

export function writeThumbnail(thumbnailBuffer: Buffer): void {
    ensureSiteDir();
    fs.writeFileSync(logoThumbnailPath(), thumbnailBuffer);
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
    writeUtf8(logoScalePath(), JSON.stringify({ scale }));
}
