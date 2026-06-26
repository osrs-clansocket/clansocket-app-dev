import logger from "@clansocket/logger";
import { existsSync, readdirSync, unlinkSync } from "node:fs";
import { resolve } from "node:path";
import { clanDirPath } from "../../database/core/database.js";
import { ICON_PREFIX_CUSTOMIZED, ICON_PREFIX_PRISTINE } from "./icon-constants.js";

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
