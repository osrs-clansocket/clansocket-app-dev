import { BTN_VARIANT_OUTLINE, button, div, input, type Instance, baseProps } from "../../../../factory/index.js";
import { identityClient, RSN_MAX_LEN } from "../../../../../state/identity/identity-client/index.js";
import { setStatus } from "./formatting.js";
import { FORM_FORM_ROW, FORM_INPUT } from "../../../../forms/form-classes.js";
export { rsnListRenderer, type RsnListRenderer } from "./rsn-list-renderer.js";

async function performRsnClaim(
    rsnInput: Instance<HTMLInputElement>,
    refresh: () => void,
    status: Instance,
): Promise<void> {
    const value = rsnInput.el.value.trim();
    if (value.length === 0) {
        setStatus(status, "RSN required.");
        return;
    }
    const result = await identityClient.requestRsn(value);
    if (result.ok) {
        setStatus(status, "Queued. Log into OSRS via RuneLite with the ClanSocket plugin enabled to confirm.");
        rsnInput.el.value = "";
        refresh();
    } else {
        setStatus(status, result.message ?? `failed: ${result.error}`);
    }
}

export function buildClaimForm(refresh: () => void, status: Instance): Instance {
    const rsnInput = input({
        classes: [FORM_INPUT],
        type: "text",
        maxlength: String(RSN_MAX_LEN),
        placeholder: "RSN to claim",
        autocomplete: "off",
        ariaLabel: "RSN to claim",
        context: "enter an RSN to claim and verify",
        meta: ["input", "rsn"],
    });
    return div(baseProps([FORM_FORM_ROW]), [
        rsnInput,
        button({
            variant: BTN_VARIANT_OUTLINE,

            text: "Verify",
            context: "verify and claim this RSN",
            meta: ["action", "rsn"],
            onClick: () => void performRsnClaim(rsnInput, refresh, status),
        }),
    ]);
}
