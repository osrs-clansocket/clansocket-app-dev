import { saturateAccountsWom, type WomAccountRow } from "../../database/wom/saturate/saturate-accounts.js";
import { saturateBossesWom, type WomBossRow } from "../../database/wom/saturate/saturate-bosses.js";
import { saturateCluesWom, type WomClueRow } from "../../database/wom/saturate/saturate-clues.js";
import { saturateStatsWom, type WomStatRow } from "../../database/wom/saturate/saturate-stats.js";

export interface RowBundle {
    statRows: WomStatRow[];
    bossRows: WomBossRow[];
    clueRows: WomClueRow[];
    accountRows: WomAccountRow[];
}

export interface WriteCounts {
    statsWritten: number;
    bossesWritten: number;
    cluesWritten: number;
    accountsWritten: number;
}

export function saturateAllModes(clanId: string, modes: string[], rows: RowBundle): WriteCounts {
    let statsWritten = 0;
    let bossesWritten = 0;
    let cluesWritten = 0;
    let accountsWritten = 0;
    for (const mode of modes) {
        statsWritten += saturateStatsWom(clanId, mode, rows.statRows);
        bossesWritten += saturateBossesWom(clanId, mode, rows.bossRows);
        cluesWritten += saturateCluesWom(clanId, mode, rows.clueRows);
        accountsWritten += saturateAccountsWom(clanId, mode, rows.accountRows);
    }
    return { statsWritten, bossesWritten, cluesWritten, accountsWritten };
}
