import { type Request, type Response } from "express";
import { requireSiteAccount } from "../../auth/site-middleware.js";
import { bindStreamLifecycle, openEventStream } from "../../shared/http/sse-stream.js";
import { HTTP_BAD_REQUEST } from "../../shared/http/http-status.js";
import { resolveTopic } from "../streams/projection-registry.js";
import "../streams/projection-topics.js";
import { parseSubs, type ParsedSub } from "./streams-sub-parser.js";
import { attachOne, topicParamsOf } from "./streams-attachers.js";
import { mountedRouter } from "./_mount-registry.js";

const router = mountedRouter();

function validateProjectionSubs(subs: readonly ParsedSub[], siteAccountId: string, res: Response): boolean {
    for (const sub of subs) {
        if (sub.kind !== "projection") continue;
        if (typeof sub.raw.topic !== "string") {
            res.status(HTTP_BAD_REQUEST).json({ error: "missing_topic", id: sub.id });
            return false;
        }
        const def = resolveTopic(sub.raw.topic, siteAccountId, topicParamsOf(sub.raw));
        if (!def) {
            res.status(HTTP_BAD_REQUEST).json({ error: "bad_topic", topic: sub.raw.topic });
            return false;
        }
    }
    return true;
}

function gateStreamSubs(req: Request, res: Response): ReturnType<typeof parseSubs> | null {
    const subsRaw = typeof req.query.subs === "string" ? req.query.subs : null;
    if (subsRaw === null) {
        res.status(HTTP_BAD_REQUEST).json({ error: "missing_subs" });
        return null;
    }
    let subsInput: unknown;
    try {
        subsInput = JSON.parse(subsRaw);
    } catch {
        res.status(HTTP_BAD_REQUEST).json({ error: "bad_subs_json" });
        return null;
    }
    const parsed = parseSubs(subsInput);
    if (!parsed.ok) {
        res.status(HTTP_BAD_REQUEST).json({ error: parsed.error, field: parsed.field });
        return null;
    }
    return parsed;
}

(() => {
    router.get("/me/stream", requireSiteAccount, (req: Request, res: Response) => {
        const siteAccountId = req.siteAccountId!;
        const parsed = gateStreamSubs(req, res);
        if (!parsed || !parsed.ok) return;
        if (!validateProjectionSubs(parsed.subs, siteAccountId, res)) return;
        openEventStream(res);
        const cleanups: Array<() => void> = [];
        const cleanupAll = (): void => {
            for (const c of cleanups) c();
            cleanups.length = 0;
        };
        for (const sub of parsed.subs) {
            const unsub = attachOne({ sub, siteAccountId, res, cleanupAll });
            if (unsub) cleanups.push(unsub);
        }
        bindStreamLifecycle(req, cleanupAll);
    });
})();

export default router;
