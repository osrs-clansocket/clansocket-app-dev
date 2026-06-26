import { type Request, type Response } from "express";
import { handleAsync } from "../../api/middleware.js";
import { vaultKeys } from "../../clan-vault/index.js";
import type { Actor } from "../../clan-vault/shared/vault-types.js";
import { clanWomIdentity } from "../../database/wom/identity/get-clan-identity.js";
import { findActiveOutbound, type ActiveOutboundRow } from "../../database/wom/outbound/active-by-kind.js";
import { rsnsByAccount } from "../../database/site/rsn/state.js";
import { withClanTry } from "../../clans/preflights/with-clan-try.js";
import { breakerOpenUntil } from "../dispatcher/breaker.js";
import { mountedRouter } from "./_mount-registry.js";

const ENTRY_KEY_WOM = "wom";
const REQUEST_KIND_VERIFY = "verify-credentials";

interface WomStatusResponse {
    linked: boolean;
    linker_site_account_id: string | null;
    linker_rsn: string | null;
    linker_rank: string | null;
    wom_group_id: number | null;
    cached_group_name: string | null;
    last_verified_at: number | null;
    last_verified_status: string | null;
    last_backfill_at: number | null;
    last_backfill_status: string | null;
    next_backfill_eligible_at: number | null;
    pending_update: ActiveOutboundRow | null;
    outage_retry_at: number | null;
}

interface ResolvedLinker {
    rsn: string | null;
    rank: string | null;
}

const STATUS_DEFAULTS: WomStatusResponse = {
    linked: false,
    linker_site_account_id: null,
    linker_rsn: null,
    linker_rank: null,
    wom_group_id: null,
    cached_group_name: null,
    last_verified_at: null,
    last_verified_status: null,
    last_backfill_at: null,
    last_backfill_status: null,
    next_backfill_eligible_at: null,
    pending_update: null,
    outage_retry_at: null,
};

function emptyStatus(): WomStatusResponse {
    return { ...STATUS_DEFAULTS };
}

function resolveLinkerIdentity(siteAccountId: string): ResolvedLinker {
    const rows = rsnsByAccount(siteAccountId);
    if (rows.length === 0) return { rsn: null, rank: null };
    const row = rows[0];
    return { rsn: row.rsn, rank: row.current_rank };
}

const router = mountedRouter();

interface LinkedStatusArgs {
    identity: NonNullable<ReturnType<typeof clanWomIdentity>>;
    vaultEntries: Awaited<ReturnType<typeof vaultKeys>>;
}

function buildLinkedStatus(a: LinkedStatusArgs & { clanId: string }): WomStatusResponse {
    const womEntry = a.vaultEntries.find((e) => e.entry_key === ENTRY_KEY_WOM);
    const linker = resolveLinkerIdentity(a.identity.linker_site_account_id);
    return {
        ...STATUS_DEFAULTS,
        linked: true,
        linker_site_account_id: a.identity.linker_site_account_id,
        linker_rsn: linker.rsn,
        linker_rank: linker.rank,
        wom_group_id: a.identity.wom_group_id,
        cached_group_name: a.identity.cached_group_name,
        last_verified_at: womEntry?.last_verified_at ?? null,
        last_verified_status: womEntry?.last_verified_status ?? null,
        last_backfill_at: a.identity.last_backfill_at,
        last_backfill_status: a.identity.last_backfill_status,
        next_backfill_eligible_at: a.identity.next_backfill_eligible_at,
        pending_update: findActiveOutbound(a.clanId, REQUEST_KIND_VERIFY),
        outage_retry_at: breakerOpenUntil(a.clanId),
    };
}

(() => {
    router.get(
        "/:slug",
        handleAsync((req: Request, res: Response) =>
            withClanTry(req, res, { label: "wom", errorCode: "status_failed" }, async (ctx) => {
                const { clan, sid } = ctx;
                const identity = clanWomIdentity(clan.id);
                if (!identity) {
                    res.json(emptyStatus());
                    return;
                }
                const vaultEntries = await vaultKeys(clan.id, { kind: "user", user_id: sid } satisfies Actor);
                res.json(buildLinkedStatus({ identity, vaultEntries, clanId: clan.id }));
            }),
        ),
    );
})();

export default router;
