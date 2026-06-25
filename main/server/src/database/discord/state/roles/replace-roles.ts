import type Database from "better-sqlite3";
import { discordGuildDb, replaceGuildRows } from "../../discord.js";
import type { RoleRow } from "../types.js";

const DELETE_BY_GUILD_SQL = `DELETE FROM discord_roles WHERE guild_id = ?`;
const INSERT_SQL = `
INSERT INTO discord_roles (role_id, guild_id, name, color, hoist, mentionable, position, permissions, managed, icon_url, unicode_emoji, updated_at)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

const BOOL_TRUE = 1;
const BOOL_FALSE = 0;

function insertOneRole(insertStmt: Database.Statement, r: RoleRow, now: number): void {
    insertStmt.run(
        r.role_id,
        r.guild_id,
        r.name,
        r.color,
        r.hoist ? BOOL_TRUE : BOOL_FALSE,
        r.mentionable ? BOOL_TRUE : BOOL_FALSE,
        r.position,
        r.permissions,
        r.managed ? BOOL_TRUE : BOOL_FALSE,
        r.icon_url,
        r.unicode_emoji,
        now,
    );
}

export function replaceRolesGuild(clanId: string, guildId: string, roles: readonly RoleRow[]): void {
    const insertStmt = discordGuildDb(clanId, guildId).prepare(INSERT_SQL);
    const now = Date.now();
    replaceGuildRows({
        clanId,
        guildId,
        deleteSql: DELETE_BY_GUILD_SQL,
        rows: roles,
        upsert: (r) => insertOneRole(insertStmt, r, now),
        debugTag: "replace-roles",
    });
}
