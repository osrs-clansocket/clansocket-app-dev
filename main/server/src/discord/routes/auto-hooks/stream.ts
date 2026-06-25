import { type Request, type Response } from "express";
import { validateGuildId } from "../../../api/middleware.js";
import { requireSiteAccount } from "../../../auth/site-middleware.js";
import { streamDbChanges } from "../../../data-rights/streams/db-changes-stream.js";
import { guildScopeKey } from "../../../data-rights/streams/writes-stream.js";
import { clanByGuild } from "../route-common/preflight.js";

import { MOUNT_AUTO_HOOKS } from "../route-common/route-paths.js";

import { mountedRouter } from "../_mount-registry.js";
const TABLE = "discord_auto_hooks";

const router = mountedRouter(MOUNT_AUTO_HOOKS);

(() => {
    router.get("/:guildId/stream", requireSiteAccount, validateGuildId, (req: Request, res: Response) => {
        const ctx = clanByGuild(req, res);
        if (!ctx) return;
        streamDbChanges({
            req,
            res,
            scopeKey: guildScopeKey(ctx.clanId, ctx.guildId),
            tables: [TABLE],
            eventName: "change",
            readyData: { clanId: ctx.clanId, guildId: ctx.guildId },
            extras: { emitPayload: (event) => ({ guildId: ctx.guildId, kind: event.kind }) },
        });
    });
})();

export default router;
