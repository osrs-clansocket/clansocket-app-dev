import logger from "@clansocket/logger";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { getClanDb } from "../database/index.js";
import { clanDirPath } from "../database/core/database.js";
import type { OwnedRsnWindow } from "./temporal-correlation.js";

function clanDbExists(clanId: string): boolean {
    return existsSync(resolve(clanDirPath(clanId), "clan.db"));
}

function dropWindowed(clanId: string, windows: OwnedRsnWindow[], sql: string, label: string): number {
    if (windows.length === 0 || !clanDbExists(clanId)) return 0;
    const stmt = getClanDb(clanId).prepare(sql);
    logger.debug(`[temporal-drops] ${label} clanId=${clanId} windows=${windows.length}`);
    let n = 0;
    for (const w of windows) {
        n += stmt.run(w.rsn, w.firstSeen, w.lastSeen).changes;
    }
    return n;
}

export function dropOwnedMembers(clanId: string, windows: OwnedRsnWindow[]): number {
    return dropWindowed(
        clanId,
        windows,
        `DELETE FROM clan_members WHERE member_name = ? AND last_observed_at >= ? AND first_observed_at <= ?`,
        "dropOwnedMembers",
    );
}

export function dropOwnedDiffs(clanId: string, windows: OwnedRsnWindow[]): number {
    return dropWindowed(
        clanId,
        windows,
        `DELETE FROM clan_roster_diffs WHERE member_name = ? AND detected_at BETWEEN ? AND ?`,
        "dropOwnedDiffs",
    );
}
