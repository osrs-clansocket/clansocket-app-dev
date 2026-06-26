import logger from "@clansocket/logger";
import { pluginModes } from "../../database/core/database.js";
import { hashByRsn } from "../../database/wom/saturate/resolve-account-hash.js";
import type { WomBossRow } from "../../database/wom/saturate/saturate-bosses.js";
import type { WomClueRow } from "../../database/wom/saturate/saturate-clues.js";
import { womStatRow, type WomStatRow } from "../../database/wom/saturate/saturate-stats.js";
import { playerToSnapshot, type MappedPlayerSnapshot } from "../mappers/snapshot-mapper.js";
import { extractClueTier } from "./saturator-ops.js";
import { saturateAllModes, type RowBundle } from "./saturate-counts.js";

export interface PlayerSnapshotSaturation {
    accountHash: string;
    rsn: string;
    womPlayerId: number | null;
    updatedAtMs: number;
    statsWritten: number;
    bossesWritten: number;
    cluesWritten: number;
    accountsWritten: number;
}

function buildStatRows(accountHash: string, snapshot: MappedPlayerSnapshot, changedAtMs: number): WomStatRow[] {
    return snapshot.skills.map((row) =>
        womStatRow({
            accountHash,
            rsn: snapshot.rsn,
            skill: row.skill,
            level: row.level,
            experience: row.experience,
            lastChangedAtMs: changedAtMs,
        }),
    );
}

function buildBossRows(accountHash: string, snapshot: MappedPlayerSnapshot, changedAtMs: number): WomBossRow[] {
    return snapshot.bosses.map((row) => ({
        accountHash,
        rsn: snapshot.rsn,
        slug: row.slug,
        sourceName: row.sourceName,
        kc: row.kc,
        lastChangedAtMs: changedAtMs,
    }));
}

function buildClueRows(accountHash: string, snapshot: MappedPlayerSnapshot, changedAtMs: number): WomClueRow[] {
    const out: WomClueRow[] = [];
    for (const row of snapshot.activities) {
        const tier = extractClueTier(row.activityName);
        if (tier !== null) {
            out.push({
                accountHash,
                tier,
                rsn: snapshot.rsn,
                count: row.score,
                lastChangedAtMs: changedAtMs,
            });
        }
    }
    return out;
}

function buildAllRows(accountHash: string, snapshot: MappedPlayerSnapshot, changedAtMs: number): RowBundle {
    return {
        statRows: buildStatRows(accountHash, snapshot, changedAtMs),
        bossRows: buildBossRows(accountHash, snapshot, changedAtMs),
        clueRows: buildClueRows(accountHash, snapshot, changedAtMs),
        accountRows: [
            { accountHash, rsn: snapshot.rsn, accountType: snapshot.accountType, lastChangedAtMs: changedAtMs },
        ],
    };
}

export function saturatePlayerSnapshot(
    clanId: string,
    womGroupId: number,
    response: unknown,
): PlayerSnapshotSaturation | null {
    const snapshot = playerToSnapshot(response);
    if (!snapshot) return null;
    const modes = pluginModes(clanId);
    if (modes.length === 0) return null;
    const accountHash = hashByRsn(clanId, womGroupId, snapshot.rsn);
    const changedAtMs = snapshot.updatedAtMs;
    const rows = buildAllRows(accountHash, snapshot, changedAtMs);
    const counts = saturateAllModes(clanId, modes, rows);
    const totalWritten = counts.statsWritten + counts.bossesWritten + counts.cluesWritten + counts.accountsWritten;
    logger.info(
        `[wom-saturate] player clan=${clanId} rsn=${snapshot.rsn} stats=${rows.statRows.length} bosses=${rows.bossRows.length} clues=${rows.clueRows.length} written=${totalWritten}`,
    );
    return {
        accountHash,
        ...counts,
        rsn: snapshot.rsn,
        womPlayerId: snapshot.womPlayerId,
        updatedAtMs: changedAtMs,
    };
}
