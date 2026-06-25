import { type Request, type Response } from "express";
import { handleAsync } from "../../api/middleware.js";
import { HTTP_ACCEPTED, HTTP_CONFLICT } from "../../shared/http/http-status.js";
import { withClanTry } from "../../clans/preflights/with-clan-try.js";
import { cooldownRemaining } from "../sync/sync-cooldown.js";
import { syncRunewatchCases } from "../sync/sync-cases.js";
import { mountedRouter } from "./_mount-registry.js";

const router = mountedRouter();

function respondSyncResult(res: Response, result: Awaited<ReturnType<typeof syncRunewatchCases>>): void {
    if (!result.ok && result.cooldownActive) {
        res.status(HTTP_CONFLICT).json({
            ok: false,
            reason: "cooldown",
            cooldownRemainingMs: cooldownRemaining(Date.now()),
        });
        return;
    }
    if (!result.ok) {
        res.status(HTTP_CONFLICT).json({ ok: false, reason: result.reason });
        return;
    }
    res.status(HTTP_ACCEPTED).json({
        ok: true,
        inserted: result.inserted,
        updated: result.updated,
        deleted: result.deleted,
        hardCount: result.hardCount,
        softCount: result.softCount,
        transitions: result.transitions,
        cooldownRemainingMs: cooldownRemaining(Date.now()),
    });
}

router.post(
    "/:slug/refresh",
    handleAsync(async (req: Request, res: Response) => {
        await withClanTry(req, res, { label: "runewatch refresh", errorCode: "refresh_failed" }, async () => {
            respondSyncResult(res, await syncRunewatchCases({ manual: true }));
        });
    }),
);

export default router;
