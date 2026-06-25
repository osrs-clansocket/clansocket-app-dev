import { type Request, type Response } from "express";
import { streamDbChanges } from "../../../data-rights/streams/db-changes-stream.js";
import { SCOPE_DISCORD_BOT } from "../../../data-rights/streams/writes-stream.js";
import { preflightClan } from "../route-common/preflight.js";

import { mountedRouter } from "../_mount-registry.js";
const SERVERS_TABLE = "discord_servers";

const router = mountedRouter("/clans");

(() => {
    router.get("/:slug/servers/stream", (req: Request, res: Response) => {
        const ctx = preflightClan(req, res);
        if (!ctx) return;
        streamDbChanges({
            req,
            res,
            scopeKey: SCOPE_DISCORD_BOT,
            tables: [SERVERS_TABLE],
            eventName: "servers",
            readyData: { slug: ctx.clan.slug },
        });
    });
})();

export default router;
