import { type Request, type Response } from "express";
import { streamDbChanges } from "../../../data-rights/streams/db-changes-stream.js";
import { SCOPE_DISCORD_BOT } from "../../../data-rights/streams/writes-stream.js";
import { preflightClan } from "../route-common/preflight.js";
import { MOUNT_BYO_BOT } from "../route-common/route-paths.js";

import { mountedRouter } from "../_mount-registry.js";
const IDENTITIES_TABLE = "discord_bot_identities";
const SERVERS_TABLE = "discord_servers";

const router = mountedRouter(MOUNT_BYO_BOT);

(() => {
    router.get("/:slug/stream", (req: Request, res: Response) => {
        const ctx = preflightClan(req, res);
        if (!ctx) return;
        streamDbChanges({
            req,
            res,
            scopeKey: SCOPE_DISCORD_BOT,
            tables: [IDENTITIES_TABLE, SERVERS_TABLE],
            eventName: "byo-bot",
            readyData: { slug: ctx.clan.slug },
        });
    });
})();

export default router;
