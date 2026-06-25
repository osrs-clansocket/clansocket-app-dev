import { type Request, type Response } from "express";
import { authenticate } from "../../../api/middleware.js";
import { streamDbChanges } from "../../../data-rights/streams/db-changes-stream.js";
import { SCOPE_DISCORD_BOT } from "../../../data-rights/streams/writes-stream.js";

import { mountedRouter } from "../_mount-registry.js";
const IDENTITIES_TABLE = "discord_bot_identities";

const router = mountedRouter("/bots");

(() => {
    router.get("/stream", authenticate, (req: Request, res: Response) => {
        streamDbChanges({
            req,
            res,
            scopeKey: SCOPE_DISCORD_BOT,
            tables: [IDENTITIES_TABLE],
            eventName: "bots",
            readyData: {},
        });
    });
})();

export default router;
