import { type Request, type Response } from "express";
import { authenticate } from "../../../api/middleware.js";
import { streamDbChanges } from "../../../data-rights/streams/db-changes-stream.js";
import { guildScopeKey } from "../../../data-rights/streams/writes-stream.js";

import { mountedRouter } from "../_mount-registry.js";
const QUEUE_TABLE = "discord_draft_publish_queue";

const router = mountedRouter("/publish-queue");

(() => {
    router.get("/stream/:clanId/:guildId", authenticate, (req: Request, res: Response) => {
        const clanId = req.params.clanId as string;
        const guildId = req.params.guildId as string;
        streamDbChanges({
            req,
            res,
            scopeKey: guildScopeKey(clanId, guildId),
            tables: [QUEUE_TABLE],
            eventName: "publish",
            readyData: { clanId, guildId },
            extras: { kindFilter: "insert" },
        });
    });
})();

export default router;
