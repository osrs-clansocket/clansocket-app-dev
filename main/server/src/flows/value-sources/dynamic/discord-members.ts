import { registerValueSource } from "../../registries/value-source-registry.js";
import { queryAcrossGuilds } from "./multi-guild-query.js";

interface MemberRow {
    user_id: string;
    name: string;
    display_name: string | null;
}

registerValueSource({
    format: "discord-member-id",
    label: "Discord members",
    fetch: (clanId) =>
        queryAcrossGuilds<MemberRow>(clanId, {
            sql: "SELECT user_id, name, display_name FROM discord_members WHERE is_bot = 0 ORDER BY name",
            mapRow: (row, ctx) => {
                const label = row.display_name ?? row.name;
                return { id: row.user_id, name: `${ctx.guildName} · ${label}` };
            },
        }),
});
