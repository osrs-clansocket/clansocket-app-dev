import { getOne } from "../../core/db-ops.js";
import { getDb } from "../../core/database.js";
import { DB_NAMES } from "../../core/db-constants.js";
import type { BotIdentityRow } from "../types.js";

const OWNER_KIND_BYO = "byo";

const SQL = `SELECT bot_id, bot_name, application_id, application_name, owner_kind, owner_site_account_id, clan_id, clan_name, encrypted_token_b64, token_iv_b64, public_key, intents_bitfield, active_presence_template_id
    FROM discord_bot_identities
    WHERE owner_kind = ? AND clan_id = ? AND token_invalidated_at IS NULL`;

export function byoForClan(clanId: string): BotIdentityRow | null {
    return getOne<BotIdentityRow>(getDb(DB_NAMES.DISCORD_BOT), SQL, OWNER_KIND_BYO, clanId);
}
