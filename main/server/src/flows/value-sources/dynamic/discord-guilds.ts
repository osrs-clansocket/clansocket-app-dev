import { registerValueSource } from "../../registries/value-source-registry.js";
import { listByClan } from "../../../database/discord/servers/list-by-clan.js";

registerValueSource({
    format: "discord-guild-id",
    label: "Discord guilds",
    fetch: async (clanId) =>
        listByClan(clanId).map((row) => ({ id: row.guild_id, name: row.guild_id })),
});
