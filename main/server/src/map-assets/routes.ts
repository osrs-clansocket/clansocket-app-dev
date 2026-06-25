import { Router, type Request, type Response } from "express";
import { registerApi } from "../api-registry.js";
import { listMapRegions } from "./world-map-db.js";

const CACHE_HEADER = "public, max-age=3600, stale-while-revalidate=86400";

const router = Router();

(() => {
    router.get("/regions", (_req: Request, res: Response) => {
        res.setHeader("Cache-Control", CACHE_HEADER);
        res.json({ regions: listMapRegions() });
    });
})();

registerApi("/api/map", router);
export default router;
