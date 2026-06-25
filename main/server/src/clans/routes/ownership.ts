import { ERROR_CLAN_NOT_FOUND } from "../../shared/error-reasons.js";
import { HTTP_FORBIDDEN, HTTP_NOT_FOUND } from "../../shared/http/http-status.js";
import { type Request, type Response } from "express";
import { handleAsync } from "../../api/middleware.js";
import { clanBySlug, type ClanRow } from "../../database/index.js";
import { hashesForAccount } from "../../database/site/site-accounts/index.js";
import { requireSiteAccount } from "../../auth/site-middleware.js";
import {
    sessionsByHash,
    requestReidentifyAwait,
    type PluginLiveSession,
} from "../../plugin-api/session/session-registry/index.js";
import { purgeClanData } from "../../data-rights/purge/purge-clan.js";
import { recordAction } from "../../data-rights/cooldown.js";
import { ACTION_CLAN_DELETED } from "../../data-rights/scopes/action-kinds.js";
import {
    CLAIM_MESSAGE_NO_LIVE_PLUGIN,
    CLAIM_MESSAGE_NOT_ACTUAL_OWNER_PREFIX,
    CLAIM_MESSAGE_WRONG_RSN_OR_CLAN,
    CLAIM_REASON_NO_LIVE_PLUGIN,
    CLAIM_REASON_NOT_ACTUAL_OWNER,
    CLAIM_REASON_WRONG_RSN_OR_CLAN,
    CLAIM_MAX_LIVE_PROBES,
    CLAIM_REIDENTIFY_TIMEOUT_MS,
} from "../../auth/claim-messages.js";
import { loadOwnedClan } from "../load-owned-clan.js";
import { findTransferMatch, tryApplyTransfer } from "./ownership-transfer.js";
import { mountedRouter } from "./_mount-registry.js";

const router = mountedRouter();

function collectLiveSessions(boundHashes: readonly string[]): PluginLiveSession[] {
    const out: PluginLiveSession[] = [];
    for (const hash of boundHashes) {
        for (const hit of sessionsByHash(hash)) out.push(hit);
    }
    return out;
}

function noLivePlugin(res: Response): void {
    res.status(HTTP_FORBIDDEN).json({
        ok: false,
        reason: CLAIM_REASON_NO_LIVE_PLUGIN,
        message: CLAIM_MESSAGE_NO_LIVE_PLUGIN,
    });
}

interface TransferGateArgs {
    slug: string;
    siteAccountId: string;
    res: Response;
}

function gateTransfer(a: TransferGateArgs): { clan: ClanRow; boundHashes: string[] } | null {
    const clan = clanBySlug(a.slug);
    if (!clan || clan.archived_at !== null) {
        a.res.status(HTTP_NOT_FOUND).json({ ok: false, reason: "clan_not_found" });
        return null;
    }
    const boundHashes = hashesForAccount(a.siteAccountId);
    if (boundHashes.length === 0) {
        noLivePlugin(a.res);
        return null;
    }
    return { clan, boundHashes };
}

function transferFailure(res: Response, clanMatch: { inGameClanRank?: string | null } | null): void {
    if (clanMatch) {
        const rank = clanMatch.inGameClanRank ?? "unknown";
        res.status(HTTP_FORBIDDEN).json({
            ok: false,
            reason: CLAIM_REASON_NOT_ACTUAL_OWNER,
            message: `${CLAIM_MESSAGE_NOT_ACTUAL_OWNER_PREFIX}${rank}.`,
        });
        return;
    }
    res.status(HTTP_FORBIDDEN).json({
        ok: false,
        reason: CLAIM_REASON_WRONG_RSN_OR_CLAN,
        message: CLAIM_MESSAGE_WRONG_RSN_OR_CLAN,
    });
}

router.post(
    "/:slug/transfer-request",
    requireSiteAccount,
    handleAsync(async (req: Request, res: Response) => {
        const siteAccountId = req.siteAccountId!;
        const slug = String(req.params.slug ?? "").toLowerCase();
        const gate = gateTransfer({ slug, siteAccountId, res });
        if (!gate) return;
        const live = collectLiveSessions(gate.boundHashes);
        if (live.length === 0) {
            noLivePlugin(res);
            return;
        }
        await Promise.all(
            live
                .slice(0, CLAIM_MAX_LIVE_PROBES)
                .map((s) => requestReidentifyAwait(s.sessionId, CLAIM_REIDENTIFY_TIMEOUT_MS)),
        );
        const { ownerSession, clanMatch } = findTransferMatch(collectLiveSessions(gate.boundHashes), gate.clan.id);
        if (ownerSession) {
            tryApplyTransfer(gate.clan, siteAccountId, ownerSession.accountHash, res);
            return;
        }
        transferFailure(res, clanMatch);
    }),
);

router.delete("/:slug", requireSiteAccount, (req: Request, res: Response) => {
    const siteAccountId = req.siteAccountId!;
    const owned = loadOwnedClan(String(req.params.slug ?? "").toLowerCase(), siteAccountId);
    if (!owned) {
        res.status(HTTP_NOT_FOUND).json({ error: ERROR_CLAN_NOT_FOUND });
        return;
    }
    recordAction(siteAccountId, ACTION_CLAN_DELETED, owned.id);
    const result = purgeClanData(owned.id);
    res.json({ ok: true, ...result });
});

export default router;
