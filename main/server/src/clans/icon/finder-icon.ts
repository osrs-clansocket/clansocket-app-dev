import logger from "@clansocket/logger";
import { existsSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { clanDirPath } from "../../database/core/database.js";
import { ICON_EXTS, ICON_PREFIX_CUSTOMIZED, ICON_PREFIX_PRISTINE } from "./icon-constants.js";

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
