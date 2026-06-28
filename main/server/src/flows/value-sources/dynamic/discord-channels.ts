import { registerValueSource } from "../../registries/value-source-registry.js";
import { queryAcrossGuilds } from "./multi-guild-query.js";

interface ChannelRow {
    channel_id: string;
    name: string | null;
    type: number;
}

registerValueSource({
    format: "discord-channel-id",
    label: "Discord channels",
    fetch: (clanId) =>
        queryAcrossGuilds<ChannelRow>(clanId, {
            sql: "SELECT channel_id, name, type FROM discord_channels ORDER BY position",
            mapRow: (row, ctx) => ({
                id: row.channel_id,
                name: `${ctx.guildName} · ${row.name ?? row.channel_id}`,
                kind: String(row.type),
            }),
        }),
});
