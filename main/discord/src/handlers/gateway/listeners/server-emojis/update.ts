import { Events } from "discord.js";
import { extractEmojiRow } from "../../../../state-sync/server-emojis/extract.js";
import { registerListener } from "../../listener-registry.js";
import { pEmoji } from "../../specs/payloads.js";
import { upsertOf } from "../../specs/persisters.js";
import { passNew } from "../../specs/selectors-pass.js";

registerListener({
    event: Events.GuildEmojiUpdate,
    triggerId: "discord:server-emojis.updated",
    selectEntity: passNew,
    buildPayload: pEmoji,
    persist: upsertOf("server-emojis", extractEmojiRow),
});
