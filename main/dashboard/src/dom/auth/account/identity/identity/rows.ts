import {
    button,
    derived,
    div,
    INLINE_CONFIRM_HOST_CLASS,
    inlineConfirm,
    rsnTag,
    span,
    type Instance,
} from "../../../../factory/index.js";
import { identityClient, type VerifiedRsn } from "../../../../../state/identity/identity-client/index.js";
import { timeStore } from "../../../../../state/stores/time-store.js";
import { formatTimeLeft, formatVerifiedDate, setStatus } from "./formatting.js";
import {
    ACCOUNT_DEVICE_ROW_CLASS,
    ACCOUNT_LIST_ROW_CLASS,
    ACCOUNT_ROW_CLASS,
    ACCOUNT_ROW_DISPLACED_CLASS,
    ACCOUNT_ROW_META_CLASS,
    ACCOUNT_ROW_META_DATE_CLASS,
    ACCOUNT_ROW_META_PREFIX_CLASS,
    ACCOUNT_ROW_PRIMARY_CLASS,
    ACCOUNT_TOKEN_REVOKE_CLASS,
} from "../../../../../shared/constants/account-constants.js";
import { SURFACE_ROW_CLASS } from "../../../../../shared/constants/card-component-constants.js";
export { buildPendingRow } from "./rows-pending.js";

function earliestDeadlineOf(verifiedRsns: readonly VerifiedRsn[]): number {
    let earliest = Infinity;
    for (const r of verifiedRsns) {
        if (r.displacementDeadlineAt !== null && r.displacementDeadlineAt < earliest) {
            earliest = r.displacementDeadlineAt;
        }
    }
    return earliest;
}

export function buildDisplacedBanner(verifiedRsns: readonly VerifiedRsn[]): Instance {
    const earliestDeadline = earliestDeadlineOf(verifiedRsns);
    return div(
        {
            classes: [ACCOUNT_ROW_CLASS, ACCOUNT_ROW_DISPLACED_CLASS, ACCOUNT_LIST_ROW_CLASS, SURFACE_ROW_CLASS],
            context: null,
            meta: null,
        },
        [
            span({
                classes: [ACCOUNT_ROW_PRIMARY_CLASS],
                context: null,
                meta: null,
                text: derived(() => {
                    const left = Number.isFinite(earliestDeadline)
                        ? formatTimeLeft(earliestDeadline, timeStore.now$())
                        : "30 days";
                    return `Your RSN was reassigned. Log into RuneLite with the ClanSocket plugin enabled to link your current RSN, or this account gets removed in ${left}.`;
                }),
            }),
        ],
    );
}

function buildVerifiedMeta(r: VerifiedRsn): Instance {
    if (r.displaced) {
        return span({ classes: [ACCOUNT_ROW_META_CLASS], text: "Displaced", context: null, meta: null });
    }
    return span({ classes: [ACCOUNT_ROW_META_CLASS], context: null, meta: null }, [
        span({ classes: [ACCOUNT_ROW_META_PREFIX_CLASS], text: "Since ", context: null, meta: null }),
        span({
            classes: [ACCOUNT_ROW_META_DATE_CLASS],
            text: formatVerifiedDate(r.verifiedAt),
            context: null,
            meta: null,
        }),
    ]);
}

async function performRemoveVerified(
    r: VerifiedRsn,
    removeHost: Instance,
    refresh: () => void,
    status: Instance,
): Promise<void> {
    const confirmed = await inlineConfirm(removeHost, {
        cancelLabel: "Cancel",
        confirmLabel: "Remove",
        danger: true,
        cancelContext: `keep '${r.rsn}' linked to your account`,
        confirmContext: `confirm removing '${r.rsn}' from your account`,
    });
    if (!confirmed) return;
    const result = await identityClient.removeRsnBinding(r.accountHash);
    if (result.ok) {
        setStatus(status, "Removed.");
        refresh();
    } else {
        setStatus(status, `Remove failed: ${result.error}`);
    }
}

export function buildVerifiedRow(r: VerifiedRsn, refresh: () => void, status: Instance): Instance {
    const removeHost = div({ classes: [INLINE_CONFIRM_HOST_CLASS], context: null, meta: null });
    const removeBtn = button({
        classes: [ACCOUNT_TOKEN_REVOKE_CLASS],
        text: "Remove",
        context: "remove this verified RSN from your account",
        meta: ["destructive", "rsn"],
        onClick: () => void performRemoveVerified(r, removeHost, refresh, status),
    });
    removeHost.addChild(removeBtn);
    return div({ classes: [ACCOUNT_DEVICE_ROW_CLASS], context: null, meta: null }, [
        span({ classes: [ACCOUNT_ROW_PRIMARY_CLASS], context: null, meta: null }, [
            rsnTag({ rsn: r.rsn, rank: r.rank, context: null, meta: null }),
        ]),
        buildVerifiedMeta(r),
        removeHost,
    ]);
}
