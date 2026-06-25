import { Events } from "discord.js";
import { registerListener } from "../../listener-registry.js";
import { pEmoji } from "../../specs/payloads.js";
import { deleteOf } from "../../specs/persisters.js";
import { passthrough } from "../../specs/selectors-pass.js";

registerListener({
    event: Events.GuildEmojiDelete,
    triggerId: "discord:server-emojis.deleted",
    selectEntity: passthrough,
    buildPayload: pEmoji,
    persist: deleteOf("server-emojis"),
});
