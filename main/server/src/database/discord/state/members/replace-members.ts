import { replaceGuildRows } from "../../discord.js";
import type { MemberRow } from "../types.js";
import { upsertMember } from "./upsert-member.js";

const DELETE_ALL_SQL = `DELETE FROM discord_members WHERE guild_id = ?`;

export function replaceMembersGuild(clanId: string, guildId: string, rows: MemberRow[]): void {
    replaceGuildRows({
        clanId,
        guildId,
        rows,
        deleteSql: DELETE_ALL_SQL,
        upsert: (row) => upsertMember(clanId, guildId, row),
    });
}
