import { type Request, type Response } from "express";
import { handleAsync } from "../../api/middleware.js";
import { readVaultEntry } from "../../clan-vault/index.js";
import { clanWomIdentity } from "../../database/wom/identity/get-clan-identity.js";
import { ensureWomEnqueued } from "../../database/wom/outbound/enqueue.js";
import { HTTP_ACCEPTED, HTTP_NOT_FOUND } from "../../shared/http/http-status.js";
import { withClanTry } from "../../clans/preflights/with-clan-try.js";
import { scheduleWake } from "../dispatcher/wake-scheduler.js";
import type { WomPayload } from "../types/payload-type.js";
import { validateWomPayload } from "../validators/payload-validator.js";
import { mountedRouter } from "./_mount-registry.js";

const REQUEST_KIND_VERIFY = "verify-credentials";

const router = mountedRouter();

async function loadWomCreds(
    clanId: string,
    sid: string,
    res: Response,
): Promise<{ identity: NonNullable<ReturnType<typeof clanWomIdentity>>; creds: WomPayload } | null> {
    const identity = clanWomIdentity(clanId);
    if (!identity) {
        res.status(HTTP_NOT_FOUND).json({ error: "no_wom_linked" });
        return null;
    }
    const creds = await readVaultEntry<WomPayload>(clanId, "wom", { kind: "user", user_id: sid }, validateWomPayload);
    if (!creds) {
        res.status(HTTP_NOT_FOUND).json({ error: "no_wom_credentials" });
        return null;
    }
    return { identity, creds };
}

router.post(
    "/:slug/update-now",
    handleAsync((req: Request, res: Response) =>
        withClanTry(req, res, { label: "wom", errorCode: "update_now_failed" }, async (ctx) => {
            const loaded = await loadWomCreds(ctx.clan.id, ctx.sid, res);
            if (!loaded) return;
            const result = ensureWomEnqueued({
                clanId: ctx.clan.id,
                requestKind: REQUEST_KIND_VERIFY,
                requestPath: `/groups/${loaded.identity.wom_group_id}/update-all`,
                requestMethod: "POST",
                body: { verificationCode: loaded.creds.verification_code },
                scheduledAtMs: Date.now(),
            });
            scheduleWake(ctx.clan.id, Date.now());
            res.status(HTTP_ACCEPTED).json({
                ok: true,
                queue_id: result.queueId,
                already_queued: result.alreadyQueued,
            });
        }),
    ),
);

export default router;
