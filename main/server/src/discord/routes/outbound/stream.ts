import { type Request, type Response } from "express";
import { streamDbChanges } from "../../../data-rights/streams/db-changes-stream.js";
import { SCOPE_DISCORD_BOT } from "../../../data-rights/streams/writes-stream.js";

import { mountedRouter } from "../_mount-registry.js";
const OUTBOUND_TABLE = "discord_outbound_events";

const router = mountedRouter("/outbound");

(() => {
    router.get("/stream/:botId", (req: Request, res: Response) => {
        const botId = req.params.botId as string;
        streamDbChanges({
            req,
            res,
            scopeKey: SCOPE_DISCORD_BOT,
            tables: [OUTBOUND_TABLE],
            eventName: "outbound",
            readyData: { botId },
            extras: { kindFilter: "insert" },
        });
    });
})();

export default router;
