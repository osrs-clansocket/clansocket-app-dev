import logger from "@clansocket/logger";
import { authenticate, handleAsync, validateGuildId } from "../../../api/middleware.js";
import { upsertGuildSettings } from "../../../database/discord/state/guild-settings/upsert-guild-settings.js";
import type { GuildSettingsRow } from "../../../database/discord/state/types.js";
import { HTTP_INTERNAL_ERROR, HTTP_OK } from "../../../shared/http/http-status.js";
import { withClanCtx } from "../route-common/preflight.js";

import { mountedRouter } from "../_mount-registry.js";
interface UpsertBody {
    settings: GuildSettingsRow;
}

const router = mountedRouter("/state");

router.post(
    "/guild-settings/:guildId",
    authenticate,
    validateGuildId,
    handleAsync(
        withClanCtx(async (ctx, req, res) => {
            const body = req.body as UpsertBody;
            try {
                upsertGuildSettings(ctx.clanId, ctx.guildId, body.settings);
                res.status(HTTP_OK).json({ ok: true });
            } catch (err) {
                logger.error(`[discord] guild-settings upsert failed for ${ctx.guildId}: ${(err as Error).message}`);
                res.status(HTTP_INTERNAL_ERROR).json({ error: "guild_settings_upsert_failed" });
            }
        }),
    ),
);

export default router;
