import { getClanDb } from "../../core/database.js";
import { getOne } from "../../core/db-ops.js";

export interface PlayerFreshnessRow {
    account_hash: string;
    wom_player_id: number | null;
    last_wom_updated_at: number;
    last_saturated_at: number;
}

const SELECT_SQL = `SELECT account_hash, wom_player_id, last_wom_updated_at, last_saturated_at
                    FROM clan_wom_player_freshness
                    WHERE account_hash = ?`;

export function getPlayerFreshness(clanId: string, accountHash: string): PlayerFreshnessRow | null {
    return getOne<PlayerFreshnessRow>(getClanDb(clanId), SELECT_SQL, accountHash);
}
