import { type Request, type Response } from "express";
import { handleAsync } from "../../api/middleware.js";
import { listRunewatchCases } from "../../database/site/runewatch/list-all-cases.js";
import { HTTP_OK } from "../../shared/http/http-status.js";

import { withClanTry } from "../../clans/preflights/with-clan-try.js";
import { mountedRouter } from "./_mount-registry.js";

const router = mountedRouter();

const MAX_LIMIT = 100000;
const NO_LIMIT_FALLBACK = -1;

function parseTier(raw: unknown): "hard" | "soft" | undefined {
    if (raw === "hard" || raw === "soft") return raw;
    return undefined;
}

function parseInt32(raw: unknown, fallback: number, max: number): number {
    if (typeof raw !== "string") return fallback;
    const n = Number(raw);
    if (!Number.isFinite(n) || n < 0) return fallback;
    return Math.min(Math.floor(n), max);
}

(() => {
    router.get(
        "/:slug/cases",
        handleAsync((req: Request, res: Response) =>
            withClanTry(req, res, { label: "runewatch list-cases", errorCode: "list_cases_failed" }, () => {
                const tier = parseTier(req.query.tier);
                const rsnLike = typeof req.query.q === "string" ? req.query.q : undefined;
                const rawLimit = parseInt32(req.query.limit, NO_LIMIT_FALLBACK, MAX_LIMIT);
                const limit = rawLimit === NO_LIMIT_FALLBACK ? undefined : rawLimit;
                const offset = parseInt32(req.query.offset, 0, Number.MAX_SAFE_INTEGER);
                const cases = listRunewatchCases({ tier, rsnLike, limit, offset });
                res.status(HTTP_OK).json({ ok: true, cases });
            }),
        ),
    );
})();

export default router;
