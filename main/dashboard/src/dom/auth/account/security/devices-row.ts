import {
    button,
    div,
    INLINE_CONFIRM_HOST_CLASS,
    inlineConfirm,
    span,
    type Instance,
    baseProps,
    textProps,
} from "../../../factory/index.js";
import { isPasskeyError, passkeyClient, type PasskeyDevice } from "../../../../state/passkey/client/index.js";
import {
    ACCOUNT_DEVICE_ROW_CLASS,
    ACCOUNT_ROW_META_CLASS,
    ACCOUNT_ROW_PRIMARY_CLASS,
    ACCOUNT_TOKEN_REVOKE_CLASS,
} from "../../../../shared/constants/account-constants.js";
import { MS_PER_DAY, MS_PER_HOUR, MS_PER_MINUTE } from "../../../../state/time-units.js";

function fmtRelative(ms: number | null | undefined): string {
    if (typeof ms !== "number" || ms <= 0) return "—";
    const diff = Date.now() - ms;
    if (diff < MS_PER_MINUTE) return "now";
    if (diff < MS_PER_HOUR) return `${Math.floor(diff / MS_PER_MINUTE)}m`;
    if (diff < MS_PER_DAY) return `${Math.floor(diff / MS_PER_HOUR)}h`;
    return `${Math.floor(diff / MS_PER_DAY)}d`;
}

async function performRevokeDevice(
    d: PasskeyDevice,
    deviceLabel: string,
    revokeHost: Instance,
    onRevoked: (msg: string | null) => void,
): Promise<void> {
    const confirmed = await inlineConfirm(revokeHost, {
        cancelLabel: "Cancel",
        confirmLabel: "Revoke",
        danger: true,
        cancelContext: `keep passkey "${deviceLabel}" active`,
        confirmContext: `confirm revoking passkey "${deviceLabel}"`,
    });
    if (!confirmed) return;
    const res = await passkeyClient.revokeDevice(d.id);
    if (isPasskeyError(res)) {
        onRevoked(`revoke failed: ${res.message ?? res.error}`);
        return;
    }
    onRevoked(null);
}

export function buildDeviceRow(d: PasskeyDevice, onRevoked: (msg: string | null) => void): Instance {
    const revokeHost = div(baseProps([INLINE_CONFIRM_HOST_CLASS]));
    const deviceLabel = d.deviceName ?? "(unnamed)";
    const revokeBtn = button({
        classes: [ACCOUNT_TOKEN_REVOKE_CLASS],
        text: "Revoke",
        context: "revoke this sign-in device",
        meta: ["destructive", "device"],
        onClick: () => void performRevokeDevice(d, deviceLabel, revokeHost, onRevoked),
    });
    revokeHost.addChild(revokeBtn);
    return div(baseProps([ACCOUNT_DEVICE_ROW_CLASS]), [
        span(textProps([ACCOUNT_ROW_PRIMARY_CLASS], deviceLabel)),
        span(textProps([ACCOUNT_ROW_META_CLASS], `Used ${fmtRelative(d.lastUsedAt)}`)),
        revokeHost,
    ]);
}
