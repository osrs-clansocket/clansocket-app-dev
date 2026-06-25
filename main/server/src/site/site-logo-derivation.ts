import fs from "node:fs";
import zlib from "node:zlib";
import crypto from "node:crypto";
import {
    logoBrotliPath,
    logoMetaPath,
    logoRecordPath,
    readLogoRecord,
    writeRecordRaw,
    writeThumbnail,
} from "./site-asset-storage.js";

const VERSION_HEX_LEN = 16;

function deriveVersion(envelopeRaw: string): string {
    return crypto.createHash("sha256").update(envelopeRaw).digest("hex").slice(0, VERSION_HEX_LEN);
}

function persistDerived(envelopeRaw: string): void {
    fs.writeFileSync(logoBrotliPath(), zlib.brotliCompressSync(Buffer.from(envelopeRaw, "utf8")));
    fs.writeFileSync(logoMetaPath(), JSON.stringify({ version: deriveVersion(envelopeRaw) }), "utf8");
}

function ensureDerivedAssets(): void {
    if (fs.existsSync(logoBrotliPath()) && fs.existsSync(logoMetaPath())) return;
    const raw = readLogoRecord();
    if (raw === null) return;
    try {
        persistDerived(raw);
    } catch {
        return;
    }
}

export function readLogoBrotli(): Buffer | null {
    ensureDerivedAssets();
    const p = logoBrotliPath();
    if (!fs.existsSync(p)) return null;
    try {
        return fs.readFileSync(p);
    } catch {
        return null;
    }
}

export function logoVersion(): string | null {
    ensureDerivedAssets();
    const p = logoMetaPath();
    if (!fs.existsSync(p)) return null;
    try {
        const parsed = JSON.parse(fs.readFileSync(p, "utf8")) as { version?: unknown };
        return typeof parsed.version === "string" ? parsed.version : null;
    } catch {
        return null;
    }
}

export function writeEnvelope(envelopeRaw: string): void {
    writeRecordRaw(envelopeRaw);
    persistDerived(envelopeRaw);
}

export function writeSiteLogo(thumbnailBuffer: Buffer, envelopeRaw: string): void {
    writeThumbnail(thumbnailBuffer);
    writeRecordRaw(envelopeRaw);
    persistDerived(envelopeRaw);
}

export function clearSiteEnvelope(): void {
    for (const p of [logoRecordPath(), logoBrotliPath(), logoMetaPath()]) {
        if (fs.existsSync(p)) {
            fs.unlinkSync(p);
        }
    }
}
