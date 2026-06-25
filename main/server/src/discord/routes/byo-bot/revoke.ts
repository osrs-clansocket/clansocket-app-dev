import logger from "@clansocket/logger";
import { handleAsync } from "../../../api/middleware.js";
import { deleteVaultEntry } from "../../../clan-vault/index.js";
import type { Actor } from "../../../clan-vault/shared/vault-types.js";
import { byoForClan } from "../../../database/discord/byo/byo-identity.js";
import { listBotGuilds } from "../../../database/discord/servers/guilds-by-bot.js";
import { updateServerBot } from "../../../database/discord/servers/update-bot.js";
import { HTTP_FORBIDDEN, HTTP_INTERNAL_ERROR, HTTP_NOT_FOUND } from "../../../shared/http/http-status.js";
import { isLinker } from "../../byo-bot/auth/linker-gate.js";
import { withClan } from "../route-common/preflight.js";
import { MOUNT_BYO_BOT } from "../route-common/route-paths.js";

import { mountedRouter } from "../_mount-registry.js";
const ENTRY_KEY_DISCORD_BOT = "discord-bot";
const DEFAULT_BOT_ID = "clansocket-default";

const router = mountedRouter(MOUNT_BYO_BOT);

router.delete(
    "/:slug",
    handleAsync(
        withClan(async (ctx, _req, res) => {
            const { clan, sid } = ctx;
            try {
                const existing = byoForClan(clan.id);
                if (!existing) {
                    res.status(HTTP_NOT_FOUND).json({ error: "no_byo_bot_linked" });
                    return;
                }
                if (!isLinker(sid, clan.id, existing.owner_site_account_id ?? "")) {
                    res.status(HTTP_FORBIDDEN).json({ error: "not_linker_or_clan_owner" });
                    return;
                }
                const actor: Actor = { kind: "user", user_id: sid };
                const reroutedGuildIds = listBotGuilds(clan.id, existing.bot_id);
                for (const guildId of reroutedGuildIds) {
                    updateServerBot(clan.id, guildId, DEFAULT_BOT_ID, null);
                }
                await deleteVaultEntry(clan.id, ENTRY_KEY_DISCORD_BOT, actor);
                res.json({ ok: true, unbound_guild_ids: reroutedGuildIds });
            } catch (err) {
                logger.error(`[discord-byo] revoke failed slug=${clan.slug}: ${(err as Error).message}`);
                res.status(HTTP_INTERNAL_ERROR).json({ error: "revoke_failed" });
            }
        }),
    ),
);

export default router;
