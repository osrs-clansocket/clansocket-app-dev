import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { clanDirPath, ensureClanDir } from "../../database/core/database.js";
import type { CustomizeTransform } from "./transform.js";
import { parseTransform } from "./transform.js";
import { ICON_TRANSFORM_SIDECAR } from "./icon-constants.js";

export function readTransformSidecar(clanId: string): CustomizeTransform | null {
    const dir = clanDirPath(clanId);
    const p = resolve(dir, ICON_TRANSFORM_SIDECAR);
    if (!existsSync(p)) return null;
    try {
        const raw = readFileSync(p, "utf8");
        if (raw.length === 0) return null;
        const parsed = JSON.parse(raw) as unknown;
        return parseTransform(parsed);
    } catch {
        return null;
    }
}

export function writeTransformSidecar(clanId: string, transform: CustomizeTransform): void {
    const dir = ensureClanDir(clanId);
    const p = resolve(dir, ICON_TRANSFORM_SIDECAR);
    writeFileSync(p, JSON.stringify(transform));
}
