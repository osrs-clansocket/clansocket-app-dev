import logger from "@clansocket/logger";
import { pluginModes } from "../../database/core/database.js";

import { hashByRsn } from "../../database/wom/saturate/resolve-account-hash.js";
import { saturateCluesWom, type WomClueRow } from "../../database/wom/saturate/saturate-clues.js";
import { saturateStatsWom, womStatRow, type WomStatRow } from "../../database/wom/saturate/saturate-stats.js";
import { extractClueTier, playerChangedMs } from "./saturator-ops.js";

interface HiscoresPlayer {
    username?: string;
    displayName?: string;
    lastChangedAt?: string | null;
    updatedAt?: string | null;
}

interface HiscoresData {
    type?: string;
    rank?: number;
    level?: number;
    experience?: number;
    kills?: number;
    score?: number;
    value?: number;
}

interface HiscoresEntry {
    player?: HiscoresPlayer;
    data?: HiscoresData;
}

interface HiscoreCollectorArgs {
    clanId: string;
    womGroupId: number;
    metric: string;
    clueTier: string | null;
    statRows: WomStatRow[];
    clueRows: WomClueRow[];
}

interface HiscorePush {
    accountHash: string;
    rsn: string;
    changedAtMs: number;
}

function pushSkillRow(
    args: HiscoreCollectorArgs,
    push: HiscorePush,
    data: { level?: unknown; experience?: unknown },
): boolean {
    if (typeof data.level !== "number" || typeof data.experience !== "number") return false;
    args.statRows.push(
        womStatRow(push.accountHash, push.rsn, args.metric, data.level, data.experience, push.changedAtMs),
    );
    return true;
}

function pushActivityRow(args: HiscoreCollectorArgs, push: HiscorePush, score: unknown): void {
    if (typeof score !== "number" || args.clueTier === null) return;
    args.clueRows.push({
        accountHash: push.accountHash,
        rsn: push.rsn,
        tier: args.clueTier,
        count: score,
        lastChangedAtMs: push.changedAtMs,
    });
}

function collectHiscoreEntry(entry: HiscoresEntry, args: HiscoreCollectorArgs): void {
    const player = entry.player;
    if (!player || typeof player.displayName !== "string") return;
    const data = entry.data;
    if (!data) return;
    const push: HiscorePush = {
        accountHash: hashByRsn(args.clanId, args.womGroupId, player.displayName),
        rsn: player.displayName,
        changedAtMs: playerChangedMs(player),
    };
    if (data.type === "skill" && pushSkillRow(args, push, data)) return;
    if (data.type === "activity") pushActivityRow(args, push, data.score);
}

function collectHiscoreRows(
    entries: HiscoresEntry[],
    clanId: string,
    womGroupId: number,
    metric: string,
): { statRows: WomStatRow[]; clueRows: WomClueRow[] } {
    const statRows: WomStatRow[] = [];
    const clueRows: WomClueRow[] = [];
    const args: HiscoreCollectorArgs = {
        clanId,
        womGroupId,
        metric,
        statRows,
        clueRows,
        clueTier: extractClueTier(metric),
    };
    for (const entry of entries) collectHiscoreEntry(entry, args);
    return { statRows, clueRows };
}

export function saturateMetricHiscores(clanId: string, womGroupId: number, metric: string, response: unknown): number {
    if (!Array.isArray(response)) return 0;
    const modes = pluginModes(clanId);
    if (modes.length === 0) return 0;
    const { statRows, clueRows } = collectHiscoreRows(response as HiscoresEntry[], clanId, womGroupId, metric);
    let written = 0;
    for (const mode of modes) {
        written += saturateStatsWom(clanId, mode, statRows);
        written += saturateCluesWom(clanId, mode, clueRows);
    }
    logger.info(
        `[wom-saturate] clan=${clanId} metric=${metric} stats=${statRows.length} clues=${clueRows.length} written=${written}`,
    );
    return written;
}
