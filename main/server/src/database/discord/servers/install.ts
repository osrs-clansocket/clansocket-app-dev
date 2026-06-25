import { discordGuildDb } from "../../core/database.js";
import { DB_NAMES } from "../../core/db-constants.js";
import { getDb } from "../../core/database.js";

const DEFAULT_SETUP_STATUS = "pending";

const INSERT_SQL = `INSERT OR REPLACE INTO discord_servers (
    guild_id, guild_name, guild_icon_hash,
    clan_id, clan_name, bot_id, bot_name,
    installer_site_account_id, installer_site_account_name,
    installer_account_hash, installer_rsn,
    oauth_scopes_json, permissions_bitfield,
    installed_at, setup_status, updated_at
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

type NullableStr = string | null;

export interface InstallServerParams {
    guildId: string;
    guildName: string;
    guildIconHash: NullableStr;
    clanId: string;
    clanName: string;
    botId: string;
    botName: NullableStr;
    installerSiteAccountId: string;
    installerSiteAccountName: NullableStr;
    installerAccountHash: NullableStr;
    installerRsn: NullableStr;
    oauthScopesJson: string;
    permissionsBitfield: number;
}

function buildInsertTuple(params: InstallServerParams, now: number): unknown[] {
    return [
        params.guildId,
        params.guildName,
        params.guildIconHash,
        params.clanId,
        params.clanName,
        params.botId,
        params.botName,
        params.installerSiteAccountId,
        params.installerSiteAccountName,
        params.installerAccountHash,
        params.installerRsn,
        params.oauthScopesJson,
        params.permissionsBitfield,
        now,
        DEFAULT_SETUP_STATUS,
        now,
    ];
}

export function installServer(params: InstallServerParams): void {
    const botDb = getDb(DB_NAMES.DISCORD_BOT);
    const now = Date.now();
    botDb.prepare(INSERT_SQL).run(...buildInsertTuple(params, now));
    discordGuildDb(params.clanId, params.guildId);
}
