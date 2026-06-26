import { Events } from "discord.js";
import { STATE_KINDS } from "../../../../core/constants.js";
import { registerListener } from "../../listener-registry.js";
import { pSticker } from "../../specs/payloads.js";
import { deleteOf } from "../../specs/persisters.js";
import { stickerGuard } from "../../specs/selectors-guards.js";

registerListener({
    event: Events.GuildStickerDelete,
    triggerId: "discord:server-stickers.deleted",
    selectEntity: stickerGuard,
    buildPayload: pSticker,
    persist: deleteOf(STATE_KINDS.SERVER_STICKERS),
});
