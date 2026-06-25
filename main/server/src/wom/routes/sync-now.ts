import { type Request, type Response } from "express";
import { handleAsync } from "../../api/middleware.js";
import { HTTP_ACCEPTED, HTTP_CONFLICT, HTTP_NOT_FOUND } from "../../shared/http/http-status.js";
import { withClanTry } from "../../clans/preflights/with-clan-try.js";
import { triggerBackfillClan } from "../ingestor/backfill-orchestrator.js";
import { mountedRouter } from "./_mount-registry.js";

const router = mountedRouter();

router.post(
    "/:slug/sync-now",
    handleAsync((req: Request, res: Response) =>
        withClanTry(req, res, { label: "wom", errorCode: "sync_now_failed" }, (ctx) => {
            const result = triggerBackfillClan(ctx.clan.id);
            if (result.status === "skipped-no-identity") {
                res.status(HTTP_NOT_FOUND).json({ error: "no_wom_linked" });
                return;
            }
            if (result.status === "skipped-gate") {
                res.status(HTTP_CONFLICT).json({
                    ok: false,
                    reason: "gated",
                    next_eligible_at: result.nextEligibleAt,
                });
                return;
            }
            res.status(HTTP_ACCEPTED).json({ ok: true, enqueued: result.enqueued });
        }),
    ),
);

export default router;
