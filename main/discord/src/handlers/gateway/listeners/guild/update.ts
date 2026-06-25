import { Events } from "discord.js";
import { registerListener } from "../../listener-registry.js";
import { pGuild } from "../../specs/payloads.js";
import { persistGuildUpdate } from "../../specs/persisters.js";
import { passNew } from "../../specs/selectors-pass.js";

registerListener({
    event: Events.GuildUpdate,
    triggerId: "discord:guild.updated",
    selectEntity: passNew,
    buildPayload: pGuild,
    persist: persistGuildUpdate,
});
