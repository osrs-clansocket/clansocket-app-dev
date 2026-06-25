import { type Request, type Response } from "express";
import { requireSiteAccount } from "../../../auth/site-middleware.js";
import { listUserScopes } from "../../scopes/scopes/index.js";
import { mountedRouter } from "../_mount-registry.js";

const router = mountedRouter();

router.get("/me/scopes", requireSiteAccount, (req: Request, res: Response) => {
    res.json({ scopes: listUserScopes(req.siteAccountId!) });
});

export default router;
