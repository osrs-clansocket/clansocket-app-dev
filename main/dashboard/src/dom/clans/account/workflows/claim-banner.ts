import { derived, div, effect, onceEffect, rsnTag, span, type Instance } from "../../../factory";
import { timeStore } from "../../../../state/stores/time-store";
import type { ConsentRecord, ConsentStatus } from "../../../../state/identity/consent/consent-client.js";
import { MS_PER_MINUTE, MS_PER_SECOND } from "../../../../state/time-units.js";
import {
    ACCOUNT_CLAIM_BANNER_CLAN_CLASS,
    ACCOUNT_CLAIM_BANNER_CLASS,
    ACCOUNT_CLAIM_BANNER_DANGER_CLASS,
    ACCOUNT_CLAIM_BANNER_MUTED_CLASS,
    ACCOUNT_CLAIM_BANNER_PRIMARY_CLASS,
    ACCOUNT_CLAIM_BANNER_SEP_CLASS,
    ACCOUNT_CLAIM_BANNER_SUCCESS_CLASS,
    ACCOUNT_DEVICE_ROW_CLASS,
    ACCOUNT_ROW_META_CLASS,
    ACCOUNT_ROW_PRIMARY_CLASS,
} from "../../../../shared/constants/account-constants.js";

export interface ActiveClaim {
    id: number;
    rsn: string;
    clanName: string;
    expiresAt: number;
    status: ConsentStatus;
}

const STATUS_LABEL: Record<ConsentStatus, string> = {
    pending: "awaiting confirmation",
    confirmed: "confirmed",
    expired: "expired",
    rejected: "rejected",
    cancelled: "cancelled",
};

const STATUS_VARIANT: Record<ConsentStatus, string | null> = {
    pending: null,
    confirmed: ACCOUNT_CLAIM_BANNER_SUCCESS_CLASS,
    expired: ACCOUNT_CLAIM_BANNER_MUTED_CLASS,
    rejected: ACCOUNT_CLAIM_BANNER_DANGER_CLASS,
    cancelled: ACCOUNT_CLAIM_BANNER_MUTED_CLASS,
};

const ALL_VARIANT_CLASSES: readonly string[] = Object.values(STATUS_VARIANT).filter((v): v is string => v !== null);

function formatRemaining(expiresAt: number, now: number): string {
    const msLeft = Math.max(0, expiresAt - now);
    const m = Math.floor(msLeft / MS_PER_MINUTE);
    const s = Math.floor((msLeft % MS_PER_MINUTE) / MS_PER_SECOND);
    return `${m}m ${s}s`;
}

export function effectiveStatus(c: ActiveClaim, now: number): ConsentStatus {
    if (c.status === "pending" && now >= c.expiresAt) return "expired";
    return c.status;
}

export function recordToActive(r: ConsentRecord): ActiveClaim {
    return {
        id: r.id,
        rsn: r.targetRsn,
        clanName: r.declaredClanName ?? "",
        expiresAt: r.expiresAt,
        status: r.status,
    };
}

function metaText(c: ActiveClaim, now: number): string {
    const s = effectiveStatus(c, now);
    if (s === "pending") return `${STATUS_LABEL.pending} · ${formatRemaining(c.expiresAt, now)} left`;
    return STATUS_LABEL[s];
}

interface BannerLastState {
    rsn: string | null;
    clan: string | null;
}

function updateBannerEffect(banner: Instance, primary: Instance, c: ActiveClaim | null, last: BannerLastState): void {
    banner.el.hidden = c === null;
    for (const cls of ALL_VARIANT_CLASSES) banner.toggleClass(cls, false);
    if (c === null) {
        primary.clear();
        last.rsn = null;
        last.clan = null;
        return;
    }
    const variant = STATUS_VARIANT[effectiveStatus(c, timeStore.now$())];
    if (variant) banner.toggleClass(variant, true);
    if (c.rsn !== last.rsn || c.clanName !== last.clan) {
        // eslint-disable-next-line lvi/no-effect-rebuild
        primary.setChildren(
            rsnTag({ rsn: c.rsn, rank: null, context: null, meta: null }),
            span({ classes: [ACCOUNT_CLAIM_BANNER_SEP_CLASS], text: " → ", context: null, meta: null }),
            span({ classes: [ACCOUNT_CLAIM_BANNER_CLAN_CLASS], text: c.clanName, context: null, meta: null }),
        );
        last.rsn = c.rsn;
        last.clan = c.clanName;
    }
}

function buildBannerMeta(activeClaim: () => ActiveClaim | null): Instance {
    return span({
        classes: [ACCOUNT_ROW_META_CLASS],
        context: null,
        meta: null,
        text: derived(() => {
            const c = activeClaim();
            return c ? metaText(c, timeStore.now$()) : "";
        }),
    });
}

export function buildClaimBanner(activeClaim: () => ActiveClaim | null): Instance {
    const primary = div({
        classes: [ACCOUNT_ROW_PRIMARY_CLASS, ACCOUNT_CLAIM_BANNER_PRIMARY_CLASS],
        context: null,
        meta: null,
    });
    const banner = div(
        {
            classes: [ACCOUNT_DEVICE_ROW_CLASS, ACCOUNT_CLAIM_BANNER_CLASS],
            effects: onceEffect("pop"),
            context: null,
            meta: null,
        },
        [primary, buildBannerMeta(activeClaim)],
    );
    banner.el.hidden = true;
    const last: BannerLastState = { rsn: null, clan: null };
    banner.trackDispose(effect(() => updateBannerEffect(banner, primary, activeClaim(), last)));
    return banner;
}
