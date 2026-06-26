import express, { type Response } from "express";
import { memoryStore, type MemoryOp, type MemoryResult } from "../memory/memory-store/index.js";
import { HTTP_BAD_REQUEST, HTTP_NOT_FOUND, HTTP_OK } from "../../shared/http/http-status.js";
import { requireSiteAccount } from "../../auth/site-middleware.js";
import { registerApi } from "../../api-registry.js";

const router = express.Router();

function respondMemoryResult(res: Response, result: MemoryResult): void {
    res.status(result.ok ? HTTP_OK : HTTP_BAD_REQUEST).json(result);
}

(() => {
    router.get("/", requireSiteAccount, (_req, res) => {
        res.json({ files: memoryStore.list() });
    });
})();

(() => {
    router.get("/:id", requireSiteAccount, (req, res) => {
        const file = memoryStore.get(req.params.id as string);
        if (!file) {
            res.status(HTTP_NOT_FOUND).json({ error: "not found" });
            return;
        }
        res.json(file);
    });
})();

(() => {
    router.post("/", requireSiteAccount, (req, res) => {
        const body = req.body as Partial<MemoryOp>;
        respondMemoryResult(res, memoryStore.apply({ ...body, action: "create" } as MemoryOp));
    });
})();

(() => {
    router.put("/:id", requireSiteAccount, (req, res) => {
        const body = req.body as Partial<MemoryOp>;
        respondMemoryResult(res, memoryStore.apply({ ...body, id: req.params.id, action: "update" } as MemoryOp));
    });
})();

(() => {
    router.delete("/:id", requireSiteAccount, (req, res) => {
        respondMemoryResult(res, memoryStore.apply({ id: req.params.id as string, action: "delete" }));
    });
})();

registerApi("/api/ai/memory", router);
export default router;
