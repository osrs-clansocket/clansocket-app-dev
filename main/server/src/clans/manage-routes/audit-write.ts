import logger from "@clansocket/logger";
import { type Response } from "express";
import { parseDecimal } from "../../shared/parsers/decimal-parser.js";
import { HTTP_BAD_REQUEST, HTTP_INTERNAL_ERROR } from "../../shared/http/http-status.js";
import { perMinuteLimiter } from "../../shared/http/rate-limit.js";
import { ingestAuditBatch, revertAuditEntry, type ClientAuditEntry } from "../../database/index.js";
import { requireSiteAccount } from "../../auth/site-middleware.js";
import { withManager } from "./manager-context.js";
import { MAX_BATCH_ENTRIES, validateClientEntry } from "./validation.js";
import { mountedRouter } from "./_mount-registry.js";

const router = mountedRouter();

const auditBatchLimiter = perMinuteLimiter({ max: 60 });

router.post(
    "/:slug/manage/audit/:id/revert",
    requireSiteAccount,
    withManager((ctx, req, res) => {
        const auditId = parseDecimal(String(req.params.id ?? ""));
        if (!Number.isFinite(auditId) || auditId <= 0) {
            res.status(HTTP_BAD_REQUEST).json({ error: "bad_audit_id" });
            return;
        }
        try {
            const result = revertAuditEntry(ctx.clanId, auditId, ctx.siteAccountId);
            if (!result.ok) {
                res.status(HTTP_BAD_REQUEST).json({ error: result.reason ?? "revert_failed" });
                return;
            }
            res.json(result);
        } catch (err) {
            logger.error(`[clansocket_manage] revert failed for ${ctx.clanId}: ${(err as Error).message}`);
            res.status(HTTP_INTERNAL_ERROR).json({ error: "revert_failed" });
        }
    }),
);

type GateOutcome = { kind: "ok"; validated: ClientAuditEntry[] } | { kind: "empty" } | { kind: "error" };

function gateAuditBatch(entries: unknown[], res: Response): GateOutcome {
    if (entries.length === 0) {
        res.json({ accepted: 0, ignored: 0 });
        return { kind: "empty" };
    }
    if (entries.length > MAX_BATCH_ENTRIES) {
        res.status(HTTP_BAD_REQUEST).json({ error: "batch_too_large", maxEntries: MAX_BATCH_ENTRIES });
        return { kind: "error" };
    }
    const validated: ClientAuditEntry[] = [];
    for (const raw of entries) {
        const entry = validateClientEntry(raw);
        if (entry === null) {
            res.status(HTTP_BAD_REQUEST).json({ error: "bad_entry" });
            return { kind: "error" };
        }
        validated.push(entry);
    }
    return { kind: "ok", validated };
}

router.post(
    "/:slug/manage/audit/batch",
    auditBatchLimiter,
    requireSiteAccount,
    withManager((ctx, req, res) => {
        const body = (req.body ?? {}) as { entries?: unknown };
        if (!Array.isArray(body.entries)) {
            res.status(HTTP_BAD_REQUEST).json({ error: "missing_entries" });
            return;
        }
        const gate = gateAuditBatch(body.entries, res);
        if (gate.kind !== "ok") return;
        try {
            res.json(ingestAuditBatch(ctx.clanId, ctx.siteAccountId, gate.validated));
        } catch (err) {
            logger.error(`[clansocket_manage] audit batch failed for ${ctx.clanId}: ${(err as Error).message}`);
            res.status(HTTP_INTERNAL_ERROR).json({ error: "audit_batch_failed" });
        }
    }),
);

export default router;
