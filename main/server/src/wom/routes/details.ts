import logger from "@clansocket/logger";
import { type Response } from "express";
import { WOMClient } from "@wise-old-man/utils";
import { handleAsync } from "../../api/middleware.js";
import { readVaultEntry } from "../../clan-vault/index.js";
import { clanWomIdentity } from "../../database/wom/identity/get-clan-identity.js";
import { HTTP_BAD_GATEWAY, HTTP_NOT_FOUND, HTTP_TOO_MANY_REQUESTS } from "../../shared/http/http-status.js";
import { withClanTry } from "../../clans/preflights/with-clan-try.js";
import type { WomPayload } from "../types/payload-type.js";
import { validateWomPayload } from "../validators/payload-validator.js";
import { mountedRouter } from "./_mount-registry.js";

interface SdkError {
    statusCode?: number;
    message?: string;
}

const router = mountedRouter();

async function loadWomCreds(
    clanId: string,
    res: Response,
): Promise<{ identity: NonNullable<ReturnType<typeof clanWomIdentity>>; creds: WomPayload } | null> {
    const identity = clanWomIdentity(clanId);
    if (!identity) {
        res.status(HTTP_NOT_FOUND).json({ error: "no_wom_linked" });
        return null;
    }
    const creds = await readVaultEntry<WomPayload>(
        clanId,
        "wom",
        { kind: "system", component: "wom-details-route" },
        validateWomPayload,
    );
    if (!creds) {
        res.status(HTTP_NOT_FOUND).json({ error: "no_wom_credentials" });
        return null;
    }
    return { identity, creds };
}

function respondWomError(err: unknown, slug: string, res: Response): void {
    const sdkErr = err as SdkError;
    const statusCode = sdkErr.statusCode ?? HTTP_BAD_GATEWAY;
    if (statusCode === HTTP_TOO_MANY_REQUESTS) {
        res.status(HTTP_TOO_MANY_REQUESTS).json({ error: "wom_rate_limited" });
        return;
    }
    logger.warn(`[wom] details fetch failed slug=${slug} status=${statusCode}: ${sdkErr.message ?? ""}`);
    res.status(HTTP_BAD_GATEWAY).json({ error: "wom_upstream_failed", status: statusCode });
}

async function sendGroupDetails(
    loaded: NonNullable<Awaited<ReturnType<typeof loadWomCreds>>>,
    slug: string,
    res: Response,
): Promise<void> {
    const client = new WOMClient({ apiKey: loaded.creds.api_key, userAgent: loaded.creds.user_agent });
    try {
        const details = await client.groups.getGroupDetails(loaded.identity.wom_group_id);
        if (details === undefined) {
            res.status(HTTP_BAD_GATEWAY).json({ error: "wom_upstream_unhandled_status" });
            return;
        }
        res.json(details);
    } catch (err) {
        respondWomError(err, slug, res);
    }
}

(() => {
    router.get(
        "/:slug/details",
        handleAsync((req, res) =>
            withClanTry(req, res, { label: "wom", errorCode: "details_failed" }, async (ctx) => {
                const loaded = await loadWomCreds(ctx.clan.id, res);
                if (!loaded) return;
                await sendGroupDetails(loaded, ctx.clan.slug, res);
            }),
        ),
    );
})();

export default router;
