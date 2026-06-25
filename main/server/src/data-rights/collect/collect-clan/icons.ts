import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { ZipEntry } from "../collect-user/index.js";
import { ICON_EXTS, ICON_TRANSFORM_SIDECAR, type ClanCollectionSummary } from "./types.js";

function pickFirstIcon(clanDir: string, basename: string, clanId: string, entries: ZipEntry[]): string | null {
    for (const ext of ICON_EXTS) {
        const path = resolve(clanDir, `${basename}.${ext}`);
        if (existsSync(path)) {
            entries.push({ path: `clans/${clanId}/${basename}.${ext}`, buffer: readFileSync(path) });
            return `${basename}.${ext}`;
        }
    }
    return null;
}

function collectSidecar(clanDir: string, clanId: string, entries: ZipEntry[]): void {
    const sidecarPath = resolve(clanDir, ICON_TRANSFORM_SIDECAR);
    if (!existsSync(sidecarPath)) return;
    const buf = readFileSync(sidecarPath);
    if (buf.length > 0) {
        entries.push({ path: `clans/${clanId}/${ICON_TRANSFORM_SIDECAR}`, buffer: buf });
    }
}

export function collectClanIcons(
    clanId: string,
    clanDir: string,
    entries: ZipEntry[],
    summary: ClanCollectionSummary,
): void {
    const iconName = pickFirstIcon(clanDir, "icon", clanId, entries);
    if (iconName !== null) summary.icon = iconName;
    pickFirstIcon(clanDir, "icon-customized", clanId, entries);
    collectSidecar(clanDir, clanId, entries);
}
