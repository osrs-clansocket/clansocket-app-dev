import type { DiscordMember } from "../../../../../state/discord/client.js";
import { guildDataVersion, roleNameOr } from "../../../../../state/discord/guild-state-cache.js";

export function rolesNamesDerived(member: DiscordMember): () => string {
    return () => {
        guildDataVersion();
        if (member.role_ids.length === 0) return "no roles";
        return member.role_ids.map((rid) => roleNameOr(member.guild_id, rid, rid)).join(", ");
    };
}
