import { HTTP_BAD_REQUEST, HTTP_NOT_FOUND } from "../shared/http/http-status.js";
import { parseDecimal } from "../shared/parsers/decimal-parser.js";
import { Router, type Request, type Response } from "express";
import { requireSiteAccount } from "../auth/site-middleware.js";
import { dismissNotification, listNotificationViews } from "./notification-store.js";
import { sweepForManager, sweepStale, sweepDisplacedAccounts } from "../data-rights/purge/purge-dead-clans/index.js";
import { registerApi } from "../api-registry.js";

const router = Router();

(() => {
    router.get("/", requireSiteAccount, (req: Request, res: Response) => {
        const siteAccountId = req.siteAccountId!;
        sweepForManager(siteAccountId);
        sweepStale();
        sweepDisplacedAccounts();
        res.json({ notifications: listNotificationViews(siteAccountId) });
    });
})();

(() => {
    router.post("/:id/dismiss", requireSiteAccount, (req: Request, res: Response) => {
        const siteAccountId = req.siteAccountId!;
        const id = parseDecimal(String(req.params.id ?? ""));
        if (!Number.isFinite(id) || id <= 0) {
            res.status(HTTP_BAD_REQUEST).json({ error: "bad_id" });
            return;
        }
        const ok = dismissNotification(id, siteAccountId);
        if (!ok) {
            res.status(HTTP_NOT_FOUND).json({ error: "not_found" });
            return;
        }
        res.json({ ok: true });
    });
})();

registerApi("/api/me/notifications", router);
export default router;
