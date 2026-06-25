import { inlineConfirm, type Instance } from "../../../factory";

export async function confirmLeaveSite(host: Instance): Promise<boolean> {
    return inlineConfirm(host, {
        cancelLabel: "Cancel",
        confirmLabel: "Leave and wipe everything",
        danger: true,
        cancelContext: "stay logged in and keep your account + data",
        confirmContext: "confirm wiping all account data and leaving the site",
    });
}
