import { Events } from "discord.js";
import { extractStickerRow } from "../../../../state-sync/server-stickers/extract.js";
import { registerListener } from "../../listener-registry.js";
import { pSticker } from "../../specs/payloads.js";
import { upsertOf } from "../../specs/persisters.js";
import { stickerGuard } from "../../specs/selectors-guards.js";

registerListener({
    event: Events.GuildStickerCreate,
    triggerId: "discord:server-stickers.created",
    selectEntity: stickerGuard,
    buildPayload: pSticker,
    persist: upsertOf("server-stickers", extractStickerRow),
});
