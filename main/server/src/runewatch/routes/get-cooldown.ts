import { type Request, type Response } from "express";
import { handleAsync } from "../../api/middleware.js";
import { getRunewatchCooldown } from "../../database/site/runewatch/cooldown-get.js";
import { cooldownRemaining } from "../sync/sync-cooldown.js";
import { HTTP_OK } from "../../shared/http/http-status.js";
import { withClanTry } from "../../clans/preflights/with-clan-try.js";
import { mountedRouter } from "./_mount-registry.js";

const router = mountedRouter();

(() => {
    router.get(
        "/:slug/cooldown",
        handleAsync((req: Request, res: Response) =>
            withClanTry(req, res, { label: "runewatch", errorCode: "cooldown_failed" }, () => {
                const row = getRunewatchCooldown();
                res.status(HTTP_OK).json({
                    ok: true,
                    lastFetchAt: row.last_fetch_at,
                    lastFetchStatus: row.last_fetch_status,
                    lastHardCount: row.last_hard_count,
                    lastSoftCount: row.last_soft_count,
                    lastCaseCount: row.last_case_count,
                    cooldownRemainingMs: cooldownRemaining(Date.now()),
                });
            }),
        ),
    );
})();

export default router;
