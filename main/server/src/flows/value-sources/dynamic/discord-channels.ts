import { registerValueSource } from "../../registries/value-source-registry.js";
import { queryAcrossGuilds } from "./multi-guild-query.js";

interface ChannelRow {
    id: string;
    name: string;
    type: number;
}

registerValueSource({
    format: "discord-channel-id",
    label: "Discord channels",
    fetch: (clanId) =>
        queryAcrossGuilds<ChannelRow>(clanId, {
            sql: "SELECT id, name, type FROM discord_channels",
            mapRow: (row) => ({ id: row.id, name: row.name, kind: String(row.type) }),
        }),
});
