import { Events } from "discord.js";
import { STATE_KINDS } from "../../../../core/constants.js";
import { extractStickerRow } from "../../../../state-sync/server-stickers/extract.js";
import { registerListener } from "../../listener-registry.js";
import { pSticker } from "../../specs/payloads.js";
import { upsertOf } from "../../specs/persisters.js";
import { stickerGuardNew } from "../../specs/selectors-guards.js";

registerListener({
    event: Events.GuildStickerUpdate,
    selectEntity: stickerGuardNew,
    buildPayload: pSticker,
    persist: upsertOf(STATE_KINDS.SERVER_STICKERS, extractStickerRow),
});
