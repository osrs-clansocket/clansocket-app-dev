import logger from "@clansocket/logger";
import { handleAsync } from "../../../api/middleware.js";
import { enqueueOutboundEvent } from "../../../database/discord/outbound/enqueue.js";
import { removeServer } from "../../../database/discord/servers/remove.js";
import { accountById } from "../../../database/index.js";
import { HTTP_INTERNAL_ERROR, HTTP_NOT_FOUND } from "../../../shared/http/http-status.js";
import { withClan } from "../route-common/preflight.js";

import { mountedRouter } from "../_mount-registry.js";
const TARGET_KIND_LEAVE_GUILD = "leave_guild";
const DEFAULT_BOT_ID = "clansocket-default";

const router = mountedRouter("/clans");

interface RemoveArgs {
    clan: { id: string; display_name: string };
    sid: string;
    guildId: string;
}

function applyRemoveServer(a: RemoveArgs): boolean {
    const account = accountById(a.sid);
    const changed = removeServer({
        clanId: a.clan.id,
        removerSiteAccountId: a.sid,
        removerSiteAccountName: account?.display_name ?? null,
        guildId: a.guildId,
    });
    if (!changed) return false;
    enqueueOutboundEvent({
        botId: DEFAULT_BOT_ID,
        clanId: a.clan.id,
        clanName: a.clan.display_name,
        targetKind: TARGET_KIND_LEAVE_GUILD,
        payload: { guildId: a.guildId },
        guildId: a.guildId,
    });
    return true;
}

router.delete(
    "/:slug/servers/:guildId",
    handleAsync(
        withClan(async (ctx, req, res) => {
            const { clan, sid } = ctx;
            const guildId = req.params.guildId as string;
            try {
                if (!applyRemoveServer({ clan, sid, guildId })) {
                    res.status(HTTP_NOT_FOUND).json({ error: "server_not_found" });
                    return;
                }
                res.json({ ok: true });
            } catch (err) {
                logger.error(
                    `[discord] remove-server failed slug=${clan.slug} guild=${guildId}: ${(err as Error).message}`,
                );
                res.status(HTTP_INTERNAL_ERROR).json({ error: "remove_server_failed" });
            }
        }),
    ),
);

export default router;
