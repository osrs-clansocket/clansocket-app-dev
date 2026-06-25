import logger from "@clansocket/logger";
import { existsSync, readdirSync, statSync, unlinkSync } from "node:fs";
import { resolve } from "node:path";
import { clanDirPath } from "../../database/core/database.js";
import { ICON_EXTS, ICON_PREFIX_CUSTOMIZED, ICON_PREFIX_PRISTINE } from "./icon-constants.js";

export {
    ICON_MIME_BY_EXT,
    ICON_EXTS,
    ICON_PREFIX_PRISTINE,
    ICON_PREFIX_CUSTOMIZED,
    ICON_TRANSFORM_SIDECAR,
} from "./icon-constants.js";
export { readTransformSidecar, writeTransformSidecar } from "./transform-sidecar.js";

function isNonEmpty(p: string): boolean {
    try {
        return statSync(p).size > 0;
    } catch (err) {
        logger.debug(`[icon] stat skipped ${p}: ${(err as Error).message}`);
        return false;
    }
}

export function findIconPrefix(clanId: string, prefix: string): { path: string; ext: string } | null {
    const dir = clanDirPath(clanId);
    for (const ext of ICON_EXTS) {
        const p = resolve(dir, `${prefix.slice(0, -1)}${ext}`);
        if (existsSync(p) && isNonEmpty(p)) return { path: p, ext };
    }
    return null;
}

export function findIconPath(clanId: string): { path: string; ext: string } | null {
    return findIconPrefix(clanId, ICON_PREFIX_CUSTOMIZED) ?? findIconPrefix(clanId, ICON_PREFIX_PRISTINE);
}

export function pristineIconPath(clanId: string): { path: string; ext: string } | null {
    return findIconPrefix(clanId, ICON_PREFIX_PRISTINE);
}

function unlinkByPrefix(clanId: string, prefixes: readonly string[]): void {
    const dir = clanDirPath(clanId);
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir)) {
        if (!prefixes.some((p) => entry.startsWith(p))) continue;
        try {
            unlinkSync(resolve(dir, entry));
        } catch (err) {
            logger.debug(`[icon] unlink skipped ${entry}: ${(err as Error).message}`);
        }
    }
}

export function removeExistingIcons(clanId: string): void {
    unlinkByPrefix(clanId, [ICON_PREFIX_PRISTINE, ICON_PREFIX_CUSTOMIZED]);
}

export function removeCustomizedIcon(clanId: string): void {
    unlinkByPrefix(clanId, [ICON_PREFIX_CUSTOMIZED]);
}
