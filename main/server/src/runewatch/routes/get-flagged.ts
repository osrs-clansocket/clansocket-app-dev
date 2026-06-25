import { type Request, type Response } from "express";
import { handleAsync } from "../../api/middleware.js";
import { listFlaggedClan } from "../../database/site/runewatch/flagged-by-clan.js";
import { HTTP_OK } from "../../shared/http/http-status.js";
import { withClanTry } from "../../clans/preflights/with-clan-try.js";
import { mountedRouter } from "./_mount-registry.js";

const router = mountedRouter();

(() => {
    router.get(
        "/:slug/flagged",
        handleAsync((req: Request, res: Response) =>
            withClanTry(req, res, { label: "runewatch", errorCode: "flagged_failed" }, (ctx) => {
                const flagged = listFlaggedClan(ctx.clan.id);
                res.status(HTTP_OK).json({ ok: true, flagged });
            }),
        ),
    );
})();

export default router;
