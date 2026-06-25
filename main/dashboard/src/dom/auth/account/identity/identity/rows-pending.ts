import { button, derived, div, effect, rsnTag, span, type Instance } from "../../../../factory/index.js";
import { identityClient, type PendingRsnRequest } from "../../../../../state/identity/identity-client/index.js";
import { timeStore } from "../../../../../state/stores/time-store.js";
import { formatRemaining, setStatus } from "./formatting.js";
import {
    ACCOUNT_DEVICE_ROW_CLASS,
    ACCOUNT_ROW_META_CLASS,
    ACCOUNT_ROW_PENDING_CLASS,
    ACCOUNT_ROW_PRIMARY_CLASS,
    ACCOUNT_TOKEN_REVOKE_CLASS,
} from "../../../../../shared/constants/account-constants.js";

async function performCancelRsn(req: PendingRsnRequest, refresh: () => void, status: Instance): Promise<void> {
    const result = await identityClient.cancelRsnRequest(req.id);
    if (result.ok) {
        setStatus(status, "Cancelled.");
        refresh();
    } else {
        setStatus(status, `Cancel failed: ${result.error}`);
    }
}

function pendingCancelBtn(req: PendingRsnRequest, refresh: () => void, status: Instance): Instance {
    return button({
        classes: [ACCOUNT_TOKEN_REVOKE_CLASS],
        text: "Cancel",
        context: "cancel this pending RSN claim request",
        meta: ["action", "rsn"],
        onClick: () => void performCancelRsn(req, refresh, status),
    });
}

function pendingExpiryEffect(req: PendingRsnRequest, refresh: () => void): { expired: boolean; fn: () => void } {
    const state = { expired: false };
    return {
        expired: state.expired,
        fn: () => {
            if (state.expired) return;
            if (timeStore.now$() >= req.expiresAt) {
                state.expired = true;
                refresh();
            }
        },
    };
}

export function buildPendingRow(req: PendingRsnRequest, refresh: () => void, status: Instance): Instance {
    const countdown = span({
        classes: [ACCOUNT_ROW_META_CLASS],
        context: null,
        meta: null,
        text: derived(() => formatRemaining(req.expiresAt, timeStore.now$())),
    });
    const row = div({ classes: [ACCOUNT_DEVICE_ROW_CLASS], context: null, meta: null }, [
        span({ classes: [ACCOUNT_ROW_PRIMARY_CLASS], context: null, meta: null }, [
            rsnTag({ rsn: req.targetRsn, context: null, meta: null }),
            span({ classes: [ACCOUNT_ROW_PENDING_CLASS], text: " pending", context: null, meta: null }),
        ]),
        countdown,
        pendingCancelBtn(req, refresh, status),
    ]);
    const expiryEffect = pendingExpiryEffect(req, refresh);
    row.trackDispose(effect(expiryEffect.fn));
    return row;
}
