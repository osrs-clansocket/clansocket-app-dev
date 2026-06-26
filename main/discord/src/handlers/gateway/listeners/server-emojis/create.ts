import { Events } from "discord.js";
import { STATE_KINDS } from "../../../../core/constants.js";
import { extractEmojiRow } from "../../../../state-sync/server-emojis/extract.js";
import { registerListener } from "../../listener-registry.js";
import { pEmoji } from "../../specs/payloads.js";
import { upsertOf } from "../../specs/persisters.js";
import { passthrough } from "../../specs/selectors-pass.js";

registerListener({
    event: Events.GuildEmojiCreate,
    triggerId: "discord:server-emojis.created",
    selectEntity: passthrough,
    buildPayload: pEmoji,
    persist: upsertOf(STATE_KINDS.SERVER_EMOJIS, extractEmojiRow),
});
