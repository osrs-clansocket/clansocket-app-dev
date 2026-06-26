import {
    button,
    derived,
    div,
    effect,
    INLINE_CONFIRM_HOST_CLASS,
    inlineConfirm,
    span,
    type Instance,
    baseProps,
    textProps,
} from "../../../factory";
import type { ConsentRecord } from "../../../../state/identity/consent/consent-client.js";
import { timeStore } from "../../../../state/stores/time-store";
import {
    ACCOUNT_DEVICE_ROW_CLASS,
    ACCOUNT_ROW_META_CLASS,
    ACCOUNT_ROW_PRIMARY_CLASS,
    ACCOUNT_TOKEN_REVOKE_CLASS,
    ACCOUNT_TOKEN_REVOKE_NEUTRAL_CLASS,
} from "../../../../shared/constants/account-constants.js";
import {
    KIND_LABELS,
    STATUS_LABELS,
    cancelConsent,
    formatRelativeAge,
    formatRemaining,
    primaryText,
    setStatus,
} from "./format.js";

async function runCancelFlow(r: ConsentRecord, host: Instance, status: Instance, refresh: () => void): Promise<void> {
    const kindStr = KIND_LABELS[r.kind] ?? r.kind;
    const confirmed = await inlineConfirm(host, {
        cancelLabel: "Keep",
        confirmLabel: "Cancel request",
        danger: true,
        cancelContext: `keep the pending ${kindStr} request for '${r.targetRsn}'`,
        confirmContext: `confirm cancelling the pending ${kindStr} request for '${r.targetRsn}'`,
    });
    if (!confirmed) return;
    const result = await cancelConsent(r);
    if (result.ok) {
        setStatus(status, "Cancelled.");
        refresh();
    } else setStatus(status, `Cancel failed: ${result.error}`);
}

function bindExpiryRefresh(row: Instance, r: ConsentRecord, refresh: () => void): void {
    let expired = false;
    row.trackDispose(
        effect(() => {
            if (expired) return;
            if (timeStore.now$() >= r.expiresAt) {
                expired = true;
                refresh();
            }
        }),
    );
}

export function buildPendingRow(r: ConsentRecord, refresh: () => void, status: Instance): Instance {
    const meta = span(
        textProps(
            [ACCOUNT_ROW_META_CLASS],
            derived(() => formatRemaining(r.expiresAt, timeStore.now$())),
        ),
    );
    const cancelHost = div(baseProps([INLINE_CONFIRM_HOST_CLASS]));
    cancelHost.addChild(
        button({
            classes: [ACCOUNT_TOKEN_REVOKE_CLASS, ACCOUNT_TOKEN_REVOKE_NEUTRAL_CLASS],
            text: "Cancel",
            context: "cancel this pending consent request",
            meta: ["action"],
            onClick: () => runCancelFlow(r, cancelHost, status, refresh),
        }),
    );
    const row = div(baseProps([ACCOUNT_DEVICE_ROW_CLASS]), [
        span(textProps([ACCOUNT_ROW_PRIMARY_CLASS], primaryText(r))),
        meta,
        cancelHost,
    ]);
    bindExpiryRefresh(row, r, refresh);
    return row;
}

export function buildResolvedRow(r: ConsentRecord): Instance {
    const ts = r.resolvedAt ?? r.createdAt;
    return div(baseProps([ACCOUNT_DEVICE_ROW_CLASS]), [
        span(textProps([ACCOUNT_ROW_PRIMARY_CLASS], primaryText(r))),
        span(textProps([ACCOUNT_ROW_META_CLASS], `${STATUS_LABELS[r.status]} · ${formatRelativeAge(ts)}`)),
    ]);
}
