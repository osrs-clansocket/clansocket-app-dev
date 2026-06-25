import logger from "@clansocket/logger";
import { pluginModes } from "../../database/core/database.js";

import { hashByRsn } from "../../database/wom/saturate/resolve-account-hash.js";
import { saturateAccountsWom, type WomAccountRow } from "../../database/wom/saturate/saturate-accounts.js";
import { mapAccountType } from "../mappers/account-type-mapper.js";
import { playerChangedMs } from "./saturator-ops.js";

interface DetailsMembershipPlayer {
    id?: number;
    username?: string;
    displayName?: string;
    type?: string;
    lastChangedAt?: string | null;
    updatedAt?: string | null;
}

interface DetailsMembership {
    role?: string | null;
    player?: DetailsMembershipPlayer;
}

interface DetailsLike {
    id?: number;
    memberships?: DetailsMembership[];
}

function collectGroupAccounts(clanId: string, womGroupId: number, memberships: DetailsMembership[]): WomAccountRow[] {
    const rows: WomAccountRow[] = [];
    for (const m of memberships) {
        const player = m.player;
        if (!player || typeof player.displayName !== "string") continue;
        rows.push({
            accountHash: hashByRsn(clanId, womGroupId, player.displayName),
            rsn: player.displayName,
            accountType: mapAccountType(player.type),
            lastChangedAtMs: playerChangedMs(player),
        });
    }
    return rows;
}

export function saturateGroupDetails(clanId: string, womGroupId: number, response: unknown): number {
    const details = response as DetailsLike;
    if (!Array.isArray(details.memberships)) return 0;
    const modes = pluginModes(clanId);
    if (modes.length === 0) return 0;
    const accountRows = collectGroupAccounts(clanId, womGroupId, details.memberships);
    let written = 0;
    for (const mode of modes) written += saturateAccountsWom(clanId, mode, accountRows);
    logger.info(
        `[wom-saturate] clan=${clanId} group=${womGroupId} accounts=${accountRows.length} written=${written} modes=${modes.length}`,
    );
    return written;
}
